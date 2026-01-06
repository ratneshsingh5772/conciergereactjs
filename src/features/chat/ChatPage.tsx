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
      <div className="flex-1 flex flex-col h-dvh relative bg-white transition-all duration-300">
        {/* Desktop Toggle Button */}
        <div className="hidden md:block absolute top-4 left-4 z-20">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
        </div>

        {/* Header for Mobile */}
        <div className="md:hidden px-4 py-3 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
              className="p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="bg-blue-50 p-1.5 rounded-lg">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900 text-[17px]">Concierge</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32 md:pb-40">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500 px-4">
                <div className="flex flex-col items-center max-w-lg w-full">
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 mb-6">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-3 tracking-tight">
                    Hi {user?.firstName}
                  </h2>
                  <p className="text-gray-500 text-[16px] md:text-lg max-w-xs md:max-w-md mx-auto leading-relaxed">
                    I can help you track expenses, set budgets, or plan investments.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
                  <button
                    onClick={() => navigate('/analytics')}
                    className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 transition-all flex items-center gap-2"
                  >
                    Analyze Spending
                  </button>
                  <button
                    onClick={() => navigate('/categories')}
                    className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 transition-all flex items-center gap-2"
                  >
                    Investment Budget
                  </button>
                   <button
                    onClick={() => navigate('/dashboard')}
                    className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl text-[14px] font-medium text-gray-700 transition-all flex items-center gap-2"
                  >
                    Dashboard
                  </button>
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
