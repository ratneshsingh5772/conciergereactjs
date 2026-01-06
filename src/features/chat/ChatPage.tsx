import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, fetchProfile } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { streamMessage } from '../../services/sse';
import { getChatHistory, getChatStats, resetChatSession, type ChatStats } from './chatAPI';
import { Bot, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        {/* Ambient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute top-[-50%] right-[-10%] w-[70%] h-[70%] bg-emerald-50/50 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-50/50 rounded-full blur-[100px]" />
        </div>

        {/* Desktop Toggle Button */}
        <div className="hidden md:block absolute top-4 left-4 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 hover:bg-white hover:shadow-md rounded-xl text-slate-400 hover:text-slate-800 transition-all border border-transparent hover:border-slate-100"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>

        {/* Header for Mobile */}
        <div className="md:hidden px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors active:bg-slate-200"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
                <div className="bg-linear-to-tr from-emerald-500 to-cyan-500 p-1.5 rounded-lg shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900 text-[16px]">Rudra AI</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth relative z-10">
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32 md:pb-40">
            {messages.length === 0 ? (
              <div className="h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 px-4">
                
                <div className="relative mb-8 group">
                   <div className="absolute inset-0 bg-linear-to-r from-emerald-400 to-cyan-400 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity rounded-full" />
                   <div className="relative bg-white p-5 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
                     <Bot className="w-12 h-12 text-emerald-600" />
                   </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-cyan-600">{user?.firstName}</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed mb-12">
                    I'm your personal financial concierge. How can I assist you today?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    {[
                        { label: "Analyze my spending habits", action: () => navigate('/analytics'), icon: "📊" },
                        { label: "Set up a monthly budget", action: () => handleSend("Help me set up a budget"), icon: "💰" },
                        { label: "Investment recommendations", action: () => handleSend("What are good investment options?"), icon: "📈" },
                        { label: "View my dashboard", action: () => navigate('/dashboard'), icon: "⚡" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 border border-slate-100 hover:border-emerald-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
                        >
                            <span className="text-2xl bg-slate-50 group-hover:bg-white p-2 rounded-xl transition-colors">{item.icon}</span>
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">{item.label}</span>
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
