import { Bot } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatMessageContent } from '../../utils/currencyFormatter';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  currencyCode?: string;
}

const MessageBubble = ({ role, content, isStreaming, currencyCode }: MessageBubbleProps) => {
  const isUser = role === 'user';
  const formattedContent = currencyCode ? formatMessageContent(content, currencyCode) : content;

  return (
    <div
      className={cn(
        "flex w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "flex max-w-[90%] md:max-w-[80%] lg:max-w-[75%] gap-x-4", 
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar - Only for Bot */}
        {!isUser && (
          <div className="shrink-0 h-8 w-8 mt-1 flex items-center justify-center">
             <div className="w-6 h-6 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
             </div>
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative text-[15px] md:text-[16px] leading-7",
            isUser 
              ? "bg-[#f0f4f9] text-[#1f1f1f] px-5 py-3 rounded-2xl" 
              : "bg-transparent text-[#1f1f1f] px-0 py-1"
          )}
        >
          <div className="whitespace-pre-wrap font-normal tracking-wide">
            {formattedContent}
            {isStreaming && !isUser && (
              <span className="inline-flex ml-2 gap-1 align-baseline">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
