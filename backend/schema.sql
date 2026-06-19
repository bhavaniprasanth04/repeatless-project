-- =====================================================================
-- REPEATLESS GMAIL INTELLIGENCE PLATFORM - SUPABASE SCHEMA SETUP (Updated)
-- Configured for 1024-dimension embeddings from nvidia/nv-embedqa-e5-v5
-- =====================================================================

-- 1. Enable the pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Threads Table
CREATE TABLE IF NOT EXISTS threads (
    id VARCHAR(255) PRIMARY KEY,              -- Matches Gmail thread ID
    subject TEXT NOT NULL,                     -- Title of the conversation thread
    sender TEXT NOT NULL,                      -- Primary sender of the thread
    date TIMESTAMP WITH TIME ZONE,             -- Date of the latest thread message
    snippet TEXT,                              -- Snippet preview of the thread
    category VARCHAR(50) DEFAULT 'Work',       -- Categorization (Work, Finance, etc.)
    summary TEXT,                              -- AI generated executive summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Emails Table
CREATE TABLE IF NOT EXISTS emails (
    id VARCHAR(255) PRIMARY KEY,              -- Matches Gmail message ID
    thread_id VARCHAR(255) REFERENCES threads(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,                      -- Sender email and name
    recipient TEXT NOT NULL,                  -- Recipient email
    subject TEXT,                              -- Email subject line
    date TIMESTAMP WITH TIME ZONE NOT NULL,    -- Date sent/received
    snippet TEXT,                              -- Brief text snippet
    body TEXT,                                 -- Full raw email body
    sanitized_body TEXT,                       -- Sanitized email text (no HTML, signatures, quotes)
    word_count INTEGER DEFAULT 0,              -- Cleaned word count (never empty string)
    tech_stack_tally JSONB,                    -- Stores the infrastructure polyglot tally metadata
    pipeline_version VARCHAR(20) DEFAULT '2.0',
    embedding vector(1024),                    -- Matches 1024-dimension of nvidia/nv-embedqa-e5-v5
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Performance and Query Indexes
CREATE INDEX IF NOT EXISTS idx_emails_thread_id ON emails(thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date DESC);
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_date ON threads(date DESC);

-- 5. Create HNSW Vector Index for Cosine Distance Search
CREATE INDEX IF NOT EXISTS idx_emails_embedding_hnsw 
ON emails USING hnsw (embedding vector_cosine_ops);

-- 6. Trigger to automatically update updated_at on threads
CREATE OR REPLACE FUNCTION update_threads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_threads_updated_at
BEFORE UPDATE ON threads
FOR EACH ROW
EXECUTE FUNCTION update_threads_updated_at();
