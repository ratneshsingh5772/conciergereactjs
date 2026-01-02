import { Send, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

const ChatInput = ({ onSend, disabled, isStreaming }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="max-w-3xl mx-auto w-full relative px-4 pb-4 md:pb-6">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-[#f0f4f9] hover:bg-[#e9eef6] focus-within:bg-white p-2 rounded-4xl transition-all duration-300 ease-out shadow-sm focus-within:shadow-xl focus-within:shadow-gray-200/50 border border-transparent focus-within:border-gray-100"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          className="w-full py-3 px-4 bg-transparent border-none focus:ring-0 resize-none max-h-40 min-h-12 text-gray-800 placeholder:text-gray-500 text-[16px] leading-relaxed"
          placeholder="Ask anything..."
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="shrink-0 p-2.5 mb-1 mr-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 transition-all duration-200 shadow-sm active:scale-95 flex items-center justify-center"
        >
          {isStreaming ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </form>
      <div className="text-center mt-2.5 text-[11px] text-gray-400 font-medium tracking-wide">
        Concierge can make mistakes. Check important info.
      </div>
    </div>
  );
};

export default ChatInput;
