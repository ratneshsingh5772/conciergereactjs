import { useRef, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, fetchProfile } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { streamMessage } from '../../services/sse';
import { getChatHistory, resetChatSession } from './chatAPI';
import { Menu, BarChart3, PiggyBank, TrendingUp, PieChart, Compass } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      };
      initData();
    } else {
      dispatch(fetchProfile());
    }
  }, [user?.id, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleReset = async () => {
    if (!user?.id) return;
    try {
      await resetChatSession(user.id);
      setMessages([]);
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
        messages={messages}
        onLogout={handleLogout} 
        onReset={handleReset}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-dvh relative bg-white transition-all duration-300 overflow-hidden">
        
        {/* Google-like Clean Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 hidden md:flex items-center justify-between px-4 z-40">
           {/* Desktop Toggle Button - Integrated into Header */}
            <div className={`flex items-center transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
            <div className="flex items-center gap-2.5 pl-1 select-none">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 via-indigo-500 to-purple-600 shadow-sm shadow-blue-500/20">
                  <span className="text-white font-bold text-xs tracking-wider font-sans">RA</span>
                </div>
                <span className="text-[18px] font-semibold tracking-tight text-[#1f1f1f]">
                  Rudra<span className="text-slate-500 font-normal ml-0.5">AI</span>
                </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth relative z-10 custom-scrollbar">
          <div className="max-w-200 mx-auto p-4 md:p-6 w-full pb-32 md:pb-40">
            {messages.length === 0 ? (
              <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-700">
                
                {/* Greeting Section */}
                <div className="text-left md:text-left w-full max-w-2xl mb-8 md:mb-12">
                   <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-[#c4c7c5] mb-2">
                      Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-purple-500">{user?.firstName}</span>
                   </h2>
                   <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-[#444746]">
                      How can I help you today?
                   </h2>
                </div>
                
                {/* Suggestion Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full max-w-4xl px-2 md:px-0">
                    {[
                        { label: "Analyze spending", action: () => navigate('/analytics'), icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Create budget", action: () => handleSend("Help me set up a budget"), icon: PiggyBank, color: "text-emerald-500", bg: "bg-emerald-50" },
                        { label: "Investment tips", action: () => handleSend("What are good investment options?"), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
                        { label: "Compare expenses", action: () => navigate('/categories'), icon: PieChart, color: "text-amber-500", bg: "bg-amber-50" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="relative p-4 md:p-5 text-left bg-[#f0f4f9] hover:bg-[#dfe4ea] active:bg-[#d0d7de] rounded-2xl transition-all duration-200 flex flex-col justify-between h-32 md:h-40 group overflow-hidden"
                        >
                            <div className={`p-2 w-fit rounded-full ${item.bg} mb-3`}>
                                <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
                            </div>
                            <span className="text-[13px] md:text-[15px] font-medium text-[#1f1f1f] leading-snug tracking-tight">{item.label}</span>
                            
                            {/* Mobile visual cue */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-opacity">
                               <Compass className="w-4 h-4 text-slate-400 rotate-45" />
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
