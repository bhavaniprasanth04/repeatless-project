require('dotenv').config();
const syncController = require('./syncController');

/**
 * Validates and retrieves Supabase environment keys.
 */
const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || url === 'your_supabase_url_here' || key === 'your_supabase_anon_key_here') {
    throw new Error('Supabase environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are not configured.');
  }
  return { url, key };
};

/**
 * Fetch threads from Supabase
 * GET /api/emails/threads
 */
exports.getThreads = async (req, res) => {
  try {
    const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

    // Fetch threads with embedded emails from public schema (PostgREST relation)
    const response = await fetch(`${supabaseUrl}/rest/v1/threads?select=*,emails(*)&order=date.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase REST error: HTTP ${response.status}`);
    }

    const threads = await response.json();

    // Map database threads to the format expected by the React frontend
    const formattedThreads = threads.map(thread => {
      const messages = (thread.emails || []).map(msg => ({
        id: msg.id,
        sender: msg.sender,
        date: msg.date,
        body: msg.body || msg.sanitized_body || '',
        headers: {
          'Message-ID': `<${msg.id}@gmail.com>`,
          'Subject': msg.subject || thread.subject
        }
      }));

      return {
        id: thread.id,
        subject: thread.subject,
        sender: thread.sender,
        date: thread.date,
        snippet: thread.snippet,
        category: thread.category,
        summary: thread.summary,
        messages: messages
      };
    });

    return res.json({
      threads: formattedThreads,
      status: syncController.syncStatus
    });
  } catch (error) {
    console.error('[Emails DB Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve threads from Supabase',
      message: error.message
    });
  }
};

/**
 * Get email categories and counts statistics
 * GET /api/emails/stats
 */
exports.getStats = async (req, res) => {
  try {
    const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

    // Fetch counts and categories via standard REST calls
    const [threadsRes, emailsRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/threads?select=id,category`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      }),
      fetch(`${supabaseUrl}/rest/v1/emails?select=id`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      })
    ]);

    if (!threadsRes.ok || !emailsRes.ok) {
      throw new Error('Supabase database stats query failed');
    }

    const threads = await threadsRes.json();
    const emails = await emailsRes.json();

    // Group categories
    const categoriesCount = { Work: 0, Finance: 0, Newsletter: 0 };
    threads.forEach(t => {
      const cat = t.category || 'Work';
      if (categoriesCount[cat] !== undefined) {
        categoriesCount[cat]++;
      } else {
        categoriesCount[cat] = 1;
      }
    });

    return res.json({
      totalThreads: threads.length,
      totalMessages: emails.length,
      categories: categoriesCount,
      lastSyncedAt: syncController.syncStatus.lastSyncedAt,
      isSyncing: syncController.syncStatus.isSyncing
    });
  } catch (error) {
    console.error('[Stats DB Error]:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve live stats from Supabase',
      message: error.message
    });
  }
};
