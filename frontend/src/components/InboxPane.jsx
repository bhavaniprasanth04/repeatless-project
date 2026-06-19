import React, { useState } from 'react';
import { RefreshCw, Search, Sparkles, User } from 'lucide-react';

export default function InboxPane({ 
  threads, 
  selectedThreadId, 
  onSelectThread, 
  onSync, 
  isSyncing, 
  isAuthenticated,
  onComposeClick
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Work', 'Finance', 'Newsletter'];

  // Filtering
  const filteredThreads = threads.filter(thread => {
    const matchesSearch = 
      thread.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.snippet.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'All' || 
      thread.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Work':
        return 'bg-blue-50 text-blue-700 border border-blue-100 font-semibold';
      case 'Finance':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold';
      case 'Newsletter':
        return 'bg-violet-50 text-violet-700 border border-violet-100 font-semibold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/20">
      {/* Pane Action Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between gap-4 bg-white/50">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-extrabold text-lg text-slate-800">Inbox</h2>
          <span className="bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-xs font-bold rounded-full text-slate-655">
            {filteredThreads.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={onComposeClick}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm hover:shadow active:scale-95 border border-brand-500/20 transition-all duration-200"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Compose with AI
              </button>
              
              <button
                onClick={onSync}
                disabled={isSyncing}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-200 active:scale-95 ${
                  isSyncing 
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                    : 'bg-white hover:bg-slate-50 text-brand-600 border-slate-200 shadow-sm hover:shadow hover:border-slate-300'
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Refreshing...' : 'Refresh'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-200/50 flex flex-col gap-3 bg-white/50">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sender, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 placeholder:text-slate-400 focus:ring-1 focus:ring-brand-500 transition-all shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === category
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/10'
                  : 'bg-white text-slate-655 border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isAuthenticated ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="bg-slate-100 p-4 rounded-full border border-slate-200/80 text-slate-400 shadow-sm animate-pulse-slow">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Gmail account not connected</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
                Please connect your Google account in the top-right corner to load and summarize your email threads.
              </p>
            </div>
          </div>
        ) : isSyncing && threads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in">
            <div className="bg-brand-50 p-4.5 rounded-full border border-brand-100 text-brand-600 animate-bounce">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Reading your inbox...</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
                We are scanning your emails and writing summaries. This might take a moment.
              </p>
            </div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <p className="text-sm text-slate-400 font-bold">No emails found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing search terms or running refresh.</p>
          </div>
        ) : (
          filteredThreads.map(thread => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative text-left hover:-translate-y-0.5 hover:shadow-md ${
                selectedThreadId === thread.id
                  ? 'border-brand-500 bg-brand-50/20 shadow-sm shadow-brand-500/5 ring-1 ring-brand-500'
                  : 'bg-white border-slate-200/70 shadow-sm'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[170px]" title={thread.sender}>
                  {thread.sender.split(' <')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                  {formatDate(thread.date)}
                </span>
              </div>

              {/* Subject */}
              <h3 className="text-sm font-extrabold text-slate-900 mb-1 truncate line-clamp-1">
                {thread.subject}
              </h3>

              {/* Snippet */}
              <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-3 leading-relaxed">
                {thread.snippet}
              </p>

              {/* Tag + AI Summary wrapper */}
              <div className="space-y-2.5">
                {/* Category label */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-semibold uppercase ${getCategoryStyles(thread.category)}`}>
                    {thread.category}
                  </span>
                </div>

                {/* AI Summary Block */}
                {thread.summary && (
                  <div className="bg-brand-50/40 border border-brand-100 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                    <Sparkles className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[9px] font-extrabold text-brand-600 tracking-wider uppercase leading-none mb-1">
                        Quick Summary
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                        {thread.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
