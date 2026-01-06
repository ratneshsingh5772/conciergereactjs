import { Link } from 'react-router-dom';
import { useState } from 'react';
import { LogOut, RefreshCw, User as UserIcon, MessageSquare, LayoutDashboard, Settings, List, BarChart3, PanelLeftClose } from 'lucide-react';
import type { User } from '../../features/auth/types';
import SettingsModal from '../common/SettingsModal';
import { formatMessageContent } from '../../utils/currencyFormatter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SidebarProps {
  user: User | null;
  messages?: Message[];
  onLogout: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ user, messages = [], onLogout, onReset, isOpen, onClose }: SidebarProps) => {
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
        className={`fixed inset-0 w-full h-full bg-slate-500/30 z-40 md:hidden backdrop-blur-[2px] transition-opacity duration-300 border-none cursor-default ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`
        fixed inset-y-0 left-0 z-50 bg-[#f0f4f9] text-[#444746] flex flex-col h-full 
        transition-all duration-300 ease-in-out shadow-lg md:shadow-none overflow-hidden
        w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
        ${isOpen ? 'md:w-72' : 'md:w-0'}
      `}>
        <div className="w-72 flex flex-col h-full overflow-hidden">
        <div className="p-4 pt-6 flex items-center justify-between">
           {/* Logo Section */}
           <div className="flex items-center gap-2.5 pl-2 opacity-100 transition-opacity select-none">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-br from-blue-600 via-indigo-500 to-purple-600 shadow-lg shadow-blue-500/20 group cursor-default">
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-white font-bold text-sm tracking-wider font-sans">RA</span>
            </div>
            <span className="text-[19px] font-semibold tracking-tight text-[#1f1f1f]">
              Rudra<span className="text-slate-500 font-normal ml-0.5">AI</span>
            </span>
          </div>
          
          <button 
            onClick={onClose}
            aria-label="Close sidebar"
            className="md:hidden p-2 hover:bg-[#e3e3e3] rounded-full text-[#444746] transition-colors"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      
      <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <button
            onClick={() => {
              onReset();
              handleMobileNav();
            }}
            className="flex items-center gap-3 py-3 px-4 bg-[#dde3ea] hover:bg-[#d0d7de] text-[#1f1f1f] rounded-2xl transition-colors duration-200 text-sm font-medium w-fit min-w-35 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New chat</span>
          </button>

          <div className="mt-8 space-y-1">
            <p className="px-4 text-[11px] font-medium text-[#444746] mb-2">Recent</p>
            
            <Link
              to="/dashboard"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-2 px-4 text-[#444746] hover:bg-[#e3e3e3] hover:text-[#1f1f1f] rounded-full transition-colors duration-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm">Dashboard</span>
            </Link>

            <Link
              to="/categories"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-2 px-4 text-[#444746] hover:bg-[#e3e3e3] hover:text-[#1f1f1f] rounded-full transition-colors duration-200"
            >
              <List className="w-4 h-4" />
              <span className="text-sm">Categories</span>
            </Link>

            <Link
              to="/analytics"
              onClick={handleMobileNav}
              className="flex items-center gap-3 py-2 px-4 text-[#444746] hover:bg-[#e3e3e3] hover:text-[#1f1f1f] rounded-full transition-colors duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Analytics</span>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {userMessages.length > 0 && (
            <div>
              <p className="px-4 text-[11px] font-medium text-[#444746] mb-2">History</p>
              <div className="space-y-0.5">
                {userMessages.map((msg) => (
                  <button
                    key={msg.id}
                    className="w-full text-left py-2 px-4 rounded-full hover:bg-[#e3e3e3] text-[#444746] hover:text-[#1f1f1f] transition-colors flex items-center gap-3 group"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm truncate">
                      {formatMessageContent(msg.content, user?.currencyCode)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[#f0f4f9]">
        <button 
          className="w-full flex items-center gap-3 mb-2 p-2 hover:bg-[#e3e3e3] rounded-full transition-colors cursor-pointer text-left focus:outline-hidden focus:ring-2 focus:ring-slate-200"
          onClick={() => setIsSettingsOpen(true)}
        >
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
            {user?.firstName?.[0] || <UserIcon className="w-4 h-4" />}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-sm text-[#1f1f1f] truncate font-medium">
              {user?.email}
            </p>
          </div>
          <Settings className="w-4 h-4 text-[#444746] shrink-0" />
        </button>
        
        <div className="px-2">
            <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-[#444746] hover:text-red-600 transition-colors py-1"
            >
            <LogOut className="w-3 h-3" />
            <span>Sign out</span>
            </button>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
