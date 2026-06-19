import React from 'react';
import { Mail, LogOut, MoreVertical } from 'lucide-react';

export default function Header({ authStatus, onConnectGoogle, onLogout, onToggleInbox }) {
  return (
    <header className="glass-panel border-b border-slate-200/80 sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        {authStatus.authenticated && (
          <button
            onClick={onToggleInbox}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm"
            title="Toggle Inbox"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>
        )}
        <div className="bg-brand-50 p-2.5 rounded-2xl border border-brand-100 text-brand-600 shadow-sm shadow-brand-500/5">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
            Repeatless <span className="text-brand-600 font-semibold">Gmail Agent</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wide">AI-Powered Inbox Assistant</p>
        </div>
      </div>

      {/* Control Area */}
      <div className="flex items-center gap-3">
        {authStatus.authenticated ? (
          <div className="flex items-center gap-3">
            {/* Active Profile Info */}
            <div className="flex items-center gap-2.5 bg-slate-100/60 pl-2 pr-3.5 py-1.5 rounded-2xl border border-slate-200/50 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-brand-500/10">
                {authStatus.user?.name ? authStatus.user.name[0] : 'B'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{authStatus.user?.name || 'Bhavani Prasanth'}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">{authStatus.user?.email || 'bhavaniprasanth04@gmail.com'}</p>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              onClick={onLogout}
              title="Disconnect Account"
              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onConnectGoogle}
            className="bg-brand-600 hover:bg-brand-500 active:scale-95 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl shadow-md shadow-brand-500/10 border border-brand-500/20 transition-all flex items-center gap-2"
          >
            Connect Gmail
          </button>
        )}
      </div>
    </header>
  );
}
