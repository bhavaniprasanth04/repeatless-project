import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

export default function ChatPane({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isAuthenticated 
}) {
  const [query, setQuery] = useState('');
  const [activeCitation, setActiveCitation] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSendMessage(query);
    setQuery('');
  };

  // Helper to parse citations inline: search for [1], [2] etc
  const renderMessageContent = (text, citations) => {
    if (!citations || citations.length === 0) return <p className="whitespace-pre-wrap leading-relaxed">{text}</p>;

    const parts = text.split(/(\[\d+\])/g);
    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          const match = part.match(/^\[(\d+)\]$/);
          if (match) {
            const citationId = match[1];
            const citation = citations.find(c => c.id === citationId);
            if (!citation) return part;

            return (
              <button
                key={index}
                onClick={() => setActiveCitation(activeCitation === citationId ? null : citationId)}
                className="mx-0.5 px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-brand-50 text-brand-655 border border-brand-100 hover:bg-brand-100 transition-all inline-flex items-center align-middle"
                title={`${citation.sender} - ${citation.subject}`}
              >
                {part}
              </button>
            );
          }
          return part;
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/20 border-l border-slate-200/80 bg-white/50">
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="font-display font-extrabold text-lg text-slate-800">Email Assistant</h2>
        </div>
        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full glow-green animate-pulse"></span>
          Active
        </div>
      </div>

      {/* Main message list area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
            <div className="bg-slate-100 p-4 rounded-full border border-slate-200 text-slate-400 shadow-sm animate-pulse-slow">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Assistant Locked</p>
              <p className="text-xs text-slate-505 mt-1.5 leading-relaxed">
                Once you connect your Gmail account, the assistant will read your inbox and answer questions about your email conversations.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 animate-fade-in">
            <div className="bg-brand-50 p-4 rounded-full border border-brand-100 text-brand-600 shadow-sm animate-pulse-slow">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-800">Ask about your emails</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto font-medium">
                Get summaries, check for tasks, find billing updates, or ask any question about your emails. The assistant answers based only on your inbox.
              </p>
            </div>
            {/* Quick Prompts */}
            <div className="grid grid-cols-2 gap-3 w-full text-left">
              {[
                "Any billing actions needed?",
                "What is Sarah's Q3 schedule?",
                "Outage reports on AWS?",
                "Summarize NVIDIA NIM updates"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="p-3.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-all hover:border-brand-400 hover:shadow-sm text-left flex justify-between items-center group active:scale-[0.98]"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}
              >
                {/* Chat bubble */}
                <div 
                  className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm shadow-brand-500/10 rounded-tr-none'
                      : 'bg-slate-100/90 border border-slate-200/60 text-slate-850 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Sender marker for AI */}
                  {msg.role !== 'user' && (
                    <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-brand-600 tracking-wider mb-2">
                      <Sparkles className="h-3 w-3" />
                      Assistant
                    </div>
                  )}

                  {/* Bubble content */}
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    renderMessageContent(msg.content, msg.citations)
                  )}
                </div>

                {/* Citations Footer for Assistant responses */}
                {msg.role !== 'user' && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 w-full max-w-[85%] bg-slate-50/60 border border-slate-200/80 rounded-2xl p-3.5 animate-fade-in">
                    <div className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      Cited Emails ({msg.citations.length})
                    </div>
                    <div className="space-y-2">
                      {msg.citations.map((cit) => (
                        <div 
                          key={cit.id}
                          className={`text-xs p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            activeCitation === cit.id 
                              ? 'bg-brand-50/40 border-brand-300 shadow-sm' 
                              : 'bg-white border-slate-200/60 hover:bg-slate-50'
                          }`}
                          onClick={() => setActiveCitation(activeCitation === cit.id ? null : cit.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-brand-50 text-brand-655 border border-brand-100 font-bold text-[9px] flex items-center justify-center shrink-0">
                              {cit.id}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="font-extrabold text-slate-800 block truncate leading-none mb-0.5">
                                {cit.subject}
                              </span>
                              <span className="text-[10px] text-slate-450 block truncate font-medium">
                                {cit.sender}
                              </span>
                            </div>
                          </div>
                          {cit.snippet && activeCitation === cit.id && (
                            <p className="text-[11px] text-slate-500 border-l-2 border-brand-300 pl-2.5 mt-2 font-medium italic leading-relaxed font-sans">
                              "{cit.snippet}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Loading bubble */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="bg-white border border-slate-200/80 text-slate-650 rounded-2xl rounded-bl-none p-3.5 max-w-[85%] flex items-center gap-3 shadow-sm animate-pulse-slow">
                  <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />
                  <span className="text-xs font-bold">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input container at the bottom */}
      <div className="p-4 border-t border-slate-200/80 bg-white/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            disabled={!isAuthenticated || isLoading}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              !isAuthenticated 
                ? "Connect your Gmail account to chat..." 
                : "Ask a question about your emails..."
            }
            className="flex-1 bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 placeholder:text-slate-455 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isAuthenticated || isLoading || !query.trim()}
            className="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white p-3.5 rounded-xl shadow-md shadow-brand-500/10 border border-brand-500/10 transition-all flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 mt-2.5 font-semibold text-center tracking-wide">
          The assistant only uses information from your inbox to answer queries.
        </p>
      </div>
    </div>
  );
}
