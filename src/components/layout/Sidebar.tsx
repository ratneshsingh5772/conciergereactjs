import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Bot, LogOut, RefreshCw, User as UserIcon, MessageSquare, History, LayoutDashboard, Settings, List, BarChart3, PanelLeftClose } from 'lucide-react';
import type { User } from '../../features/auth/types';
import type { ChatStats } from '../../features/chat/chatAPI';
import SettingsModal from '../common/SettingsModal';
import { formatMessageContent } from '../../utils/currencyFormatter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SidebarProps {
  user: User | null;
  stats: ChatStats | null;
  messages?: Message[];
  onLogout: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ user, stats, messages = [], onLogout, onReset, isOpen, onClose }: SidebarProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Filter only user messages for the history list
  const userMessages = messages.filter(m => m.role === 'user').reverse();

  const handleMobileNav = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Mobile Backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        className={`fixed inset-0 w-full h-full bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 border-none cursor-default ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 
        transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-hidden
        w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-72' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-72 flex flex-col h-full overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-tr from-emerald-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Rudra AI</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Personal Concierge</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      
      <div className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="mb-8">
          <button
            onClick={() => {
              onReset();
              handleMobileNav();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 font-semibold group transform hover:scale-[1.02]"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span>New Conversation</span>
          </button>

          <div className="mt-8 space-y-2">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Menu</p>
            
            <Link
              to="/dashboard"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <LayoutDashboard className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="font-medium relative z-10">Dashboard</span>
            </Link>

            <Link
              to="/categories"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-200 group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-linear-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <List className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
              <span className="font-medium relative z-10">Categories</span>
            </Link>

            <Link
              to="/analytics"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-3 px-4 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all duration-200 group relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <BarChart3 className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="font-medium relative z-10">Analytics</span>
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          {userMessages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-4 flex items-center gap-2">
                <History className="w-3 h-3" />
                Recent Activity
              </h3>
              <div className="space-y-1">
                {userMessages.map((msg) => (
                  <button
                    key={msg.id}
                    className="w-full text-left py-2.5 px-4 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors group flex items-center gap-3 relative overflow-hidden"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    <span className="text-sm truncate font-medium relative z-10 group-hover:translate-x-1 transition-transform">
                      {formatMessageContent(msg.content, user?.currencyCode)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">
              Session Stats
            </h3>
            <div className="grid grid-cols-2 gap-3 px-1">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1 font-medium">Messages</div>
                <div className="text-xl font-bold text-white">{stats?.totalMessages || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1 font-medium">Status</div>
                <div className={`text-sm font-bold flex items-center gap-2 ${stats?.sessionActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                   {stats?.sessionActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                  {stats?.sessionActive ? 'Active' : 'Idle'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-transform">
            {user?.firstName?.[0] || <UserIcon className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-400 truncate font-medium">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-700 transition-all duration-200 text-xs font-semibold"
            >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
            </button>
            <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 py-2.5 px-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all duration-200 text-xs font-semibold"
            >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
            </button>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
