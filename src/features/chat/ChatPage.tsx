import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, fetchProfile } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { streamMessage } from '../../services/sse';
import { getChatHistory, getChatStats, resetChatSession, type ChatStats } from './chatAPI';
import { Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const updateMessageContent = (messages: Message[], id: string, contentToAdd: string) => 
  messages.map((msg) =>
    msg.id === id ? { ...msg, content: msg.content + contentToAdd } : msg
  );

const ChatPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  // Default to open on desktop (md breakpoint is 768px), closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => 
    typeof globalThis.window === 'object' ? globalThis.window.innerWidth >= 768 : false
  );
  const [stats, setStats] = useState<ChatStats | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadStats = useCallback(async (userId: string) => {
    try {
      const data = await getChatStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  useEffect(() => {
    const loadHistory = async (userId: string) => {
      try {
        const history = await getChatHistory(userId);
        const formattedMessages: Message[] = history.flatMap((item) => [
          {
            id: `user-${item.id}`,
            role: 'user',
            content: item.userMessage,
          },
          {
            id: `agent-${item.id}`,
            role: 'assistant',
            content: item.agentResponse,
          },
        ]);
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };

    if (user?.id) {
      const initData = async () => {
        await loadHistory(user.id);
        await loadStats(user.id);
      };
      initData();
    } else {
      dispatch(fetchProfile());
    }
  }, [user?.id, dispatch, loadStats]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleReset = async () => {
    if (!user?.id) return;
    try {
      await resetChatSession(user.id);
      setMessages([]);
      loadStats(user.id);
    } catch (error) {
      console.error('Failed to reset session:', error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isStreaming || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const assistantMessageId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '' },
    ]);

    const onChunk = (chunk: string) => {
      setMessages((prev) => updateMessageContent(prev, assistantMessageId, chunk));
    };

    const onError = (err: unknown) => {
      console.error('Streaming error:', err);
      setIsStreaming(false);
      setMessages((prev) => updateMessageContent(prev, assistantMessageId, '\n[Error: Failed to get response]'));
    };

    const onComplete = () => {
      setIsStreaming(false);
      loadStats(user.id);
    };

    try {
      await streamMessage(
        userMessage.content,
        user.id,
        onChunk,
        onError,
        onComplete
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        user={user} 
        stats={stats} 
        messages={messages}
        onLogout={handleLogout} 
        onReset={handleReset}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-dvh relative bg-white transition-all duration-300 overflow-hidden">
        
        {/* Google-like Clean Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-40">
           {/* Desktop Toggle Button - Integrated into Header */}
            <div className={`hidden md:flex items-center transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-transparent hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-colors"
                title="Open Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
        </div>

        {/* Header for Mobile */}
        <div className="md:hidden px-4 py-3 bg-white/95 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:bg-slate-200"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700 text-[18px]">Rudra AI</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth relative z-10 custom-scrollbar">
          <div className="max-w-200 mx-auto p-4 md:p-6 w-full pb-32 md:pb-40">
            {messages.length === 0 ? (
              <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
                
                {/* Greeting Section */}
                <div className="text-left md:text-left w-full max-w-2xl mb-12">
                   <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-[#c4c7c5] mb-2">
                      Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">{user?.firstName}</span>
                   </h2>
                   <h2 className="text-5xl md:text-6xl font-medium tracking-tight text-[#444746]">
                      How can I help you today?
                   </h2>
                </div>
                
                {/* Suggestion Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-2xl gap-3">
                    {[
                        { label: "Analyze my spending habits", action: () => navigate('/analytics'), icon: "BarChart3" },
                        { label: "Set up a monthly budget", action: () => handleSend("Help me set up a budget"), icon: "PiggyBank" },
                        { label: "Investment recommendations", action: () => handleSend("What are good investment options?"), icon: "TrendingUp" },
                        { label: "Compare expense categories", action: () => navigate('/categories'), icon: "PieChart" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="h-32 p-5 text-left bg-[#f0f4f9] hover:bg-[#dfe4ea] rounded-2xl transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                        >
                            <span className="text-[15px] font-medium text-[#1f1f1f] pr-8 leading-snug">{item.label}</span>
                            <div className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                               <span className="text-slate-700">→</span>
                            </div>
                        </button>
                    ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && index === messages.length - 1 && msg.role === 'assistant'}
                  currencyCode={user?.currencyCode}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-6 bg-linear-to-t from-white via-white/95 to-transparent pt-10 z-20">
          <ChatInput 
            onSend={handleSend} 
            disabled={isStreaming} 
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
