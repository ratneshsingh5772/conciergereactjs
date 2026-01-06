import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Bot, LogOut, RefreshCw, User as UserIcon, MessageSquare, X, History, LayoutDashboard, Settings } from 'lucide-react';
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
        fixed inset-y-0 left-0 z-50 bg-gray-50 text-gray-700 flex flex-col h-full border-r border-gray-200 
        transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-hidden
        w-70
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-70' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-70 flex flex-col h-full overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm shadow-blue-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Concierge</h1>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Finance AI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      
      <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <button
            onClick={onReset}
            className="w-full flex items-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-full transition-all duration-200 shadow-sm hover:shadow-md font-medium group"
          >
            <div className="bg-blue-50 p-1.5 rounded-full group-hover:bg-blue-100 transition-colors">
              <RefreshCw className="w-4 h-4 text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <span className="text-sm">New Chat</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 py-3 px-4 mt-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-full transition-all duration-200 shadow-sm hover:shadow-md font-medium group"
          >
            <div className="bg-purple-50 p-1.5 rounded-full group-hover:bg-purple-100 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm">Dashboard</span>
          </Link>
        </div>

        <div className="space-y-6">
          {userMessages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
                <History className="w-3 h-3" />
                Recent Activity
              </h3>
              <div className="space-y-1">
                {userMessages.map((msg) => (
                  <button
                    key={msg.id}
                    className="w-full text-left py-2.5 px-4 rounded-full hover:bg-gray-200/60 transition-colors group flex items-center gap-3"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-gray-600 shrink-0" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate font-medium">
                      {formatMessageContent(msg.content, user?.currencyCode)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-4">
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-2 px-1">
              <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-400 mb-1 font-medium">Messages</div>
                <div className="text-xl font-bold text-gray-800">{stats?.totalMessages || 0}</div>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-400 mb-1 font-medium">Status</div>
                <div className={`text-sm font-bold ${stats?.sessionActive ? 'text-emerald-500' : 'text-gray-500'}`}>
                  {stats?.sessionActive ? 'Active' : 'Idle'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-2 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer border border-transparent hover:border-gray-100">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
            {user?.firstName?.[0] || <UserIcon className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
            <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-200 text-xs font-medium"
            >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
            </button>
            <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-xs font-medium"
            >
            <LogOut className="w-3.5 h-3.5" />
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
