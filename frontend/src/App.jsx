import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InboxPane from './components/InboxPane';
import ChatPane from './components/ChatPane';
import api from './utils/api';
import axios from 'axios';

import { Mail, Calendar, Sparkles, X } from 'lucide-react';

export default function App() {
  const [authStatus, setAuthStatus] = useState({
    authenticated: true,
    user: {
      email: 'bhavaniprasanth04@gmail.com',
      name: 'Bhavani Prasanth',
      avatar: null
    }
  });
  const [threads, setThreads] = useState([]);
  const [syncStats, setSyncStats] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  // Check auth status on load and if redirected from callback
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/status');
        setAuthStatus(res.data);
        if (res.data.authenticated) {
          fetchEmails();
        }
      } catch (err) {
        console.error('Error fetching auth status:', err);
      }
    };

    // Simple URL parameter handler for mock callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === 'true') {
      // Clear query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkAuth();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await api.get('/emails/threads');
      setThreads(res.data.threads);
      setSyncStats(res.data.status);
      setIsSyncing(res.data.status.isSyncing);
    } catch (err) {
      console.error('Error fetching email threads:', err);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await api.get('/auth/google');
      // In production we would redirect:
      // window.location.href = res.data.url;
      // In our mockup sandboxed environment, we'll hit status directly to log in:
      alert(res.data.message + '\n(Simulating login success...)');
      // Perform mock login
      const callbackRes = await api.get('/auth/status');
      setAuthStatus({
        authenticated: true,
        user: {
          email: 'user@example.com',
          name: 'Jane Doe',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        }
      });
      // Fetch threads immediately
      const threadsRes = await api.get('/emails/threads');
      setThreads(threadsRes.data.threads);
      setSyncStats(threadsRes.data.status);
    } catch (err) {
      console.error('Error connecting Google Account:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setAuthStatus({ authenticated: false, user: null });
      setThreads([]);
      setSyncStats(null);
      setMessages([]);
      setSelectedThread(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSyncEmails = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await api.post('/emails/sync');
      setSyncStats(res.data.status);
      
      // Poll sync status every second
      const interval = setInterval(async () => {
        const statusRes = await api.get('/emails/threads');
        setSyncStats(statusRes.data.status);
        if (!statusRes.data.status.isSyncing) {
          clearInterval(interval);
          setThreads(statusRes.data.threads);
          setIsSyncing(false);
        }
      }, 1000);
    } catch (err) {
      console.error('Sync request failed:', err);
      setIsSyncing(false);
    }
  };

  const handleSendMessage = async (text) => {
    // Add user message to state
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsWaitingForAI(true);

    const webhookUrl = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL || 'https://primary-production-a4edd.up.railway.app/webhook/chat-query';

    try {
      const res = await axios.post(webhookUrl, {
        message: text,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // Extended Timeout: at least 30 seconds
      });

      // Payload Parsing: Extract from output, response, or text fields
      const data = res.data;
      let responseText = '';
      let citations = [];

      if (Array.isArray(data)) {
        const firstItem = data[0] || {};
        responseText = firstItem.output || firstItem.response || firstItem.text || '';
        citations = firstItem.citations || [];
      } else if (data) {
        responseText = data.output || data.response || data.text || '';
        citations = data.citations || [];
      }

      if (!responseText) {
        responseText = 'No response received from the AI agent.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText,
        citations: citations
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      let errorMessage = 'The server is taking too long to respond.';
      
      // If it's not a timeout, customize the message if helpful, but prioritize timeout message style
      if (err.code === 'ECONNABORTED' || (err.message && err.message.toLowerCase().includes('timeout'))) {
        errorMessage = 'The server is taking too long to respond.';
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        citations: []
      }]);
    } finally {
      setIsWaitingForAI(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Interactive Global Header */}
      <Header 
        authStatus={authStatus}
        onConnectGoogle={handleConnectGoogle}
        onLogout={handleLogout}
        syncStats={syncStats}
        onSync={handleSyncEmails}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: Inbox Browser */}
        <section className="w-full md:w-[450px] shrink-0 border-r border-slate-800/80 flex flex-col h-full">
          <InboxPane 
            threads={threads}
            selectedThreadId={selectedThread?.id}
            onSelectThread={setSelectedThread}
            onSync={handleSyncEmails}
            isSyncing={isSyncing}
            isAuthenticated={authStatus.authenticated}
          />
        </section>

        {/* Right Pane: AI Conversational RAG */}
        <section className="flex-1 h-full flex flex-col">
          <ChatPane 
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isWaitingForAI}
            isAuthenticated={authStatus.authenticated}
          />
        </section>
      </main>

      {/* Thread details Modal Popup */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 uppercase tracking-wider">
                  {selectedThread.category} Thread Details
                </span>
                <h3 className="font-display font-semibold text-lg text-slate-100 mt-2 leading-snug">
                  {selectedThread.subject}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedThread(null)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* AI summary block inside thread */}
              <div className="bg-brand-500/[0.03] border border-brand-500/20 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-brand-300 uppercase leading-none mb-1.5">
                    Gemini AI Summary
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {selectedThread.summary}
                  </p>
                </div>
              </div>

              {/* Message history under the thread */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
                  Messages ({selectedThread.messages.length})
                </h4>
                {selectedThread.messages.map((msg, i) => (
                  <div key={i} className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                    {/* Message Header */}
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2.5 mb-3.5 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block">{msg.sender}</span>
                        <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                          ID: {msg.headers['Message-ID']}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.date).toLocaleString()}
                      </span>
                    </div>

                    {/* Message content body */}
                    <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                      {msg.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedThread(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-lg transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
