// StreamingMessage.tsx - Animated streaming message component
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Sparkles } from 'lucide-react';

interface StreamingMessageProps {
  text: string;
  isComplete?: boolean;
  isThinking?: boolean;
  className?: string;
}

// Animated thinking dots
export const ThinkingIndicator: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500">Thinking</span>
        <div className="flex space-x-1">
          <div
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
      <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
    </div>
  );
};

// Animated AI Avatar
export const AIAvatar: React.FC<{
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isTyping, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          sizeClasses[size],
          'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg',
          isTyping && 'animate-pulse'
        )}
      >
        <MessageCircle className={cn(iconSizes[size], 'text-white')} />
      </div>
      {/* Online indicator with pulse */}
      <div className="absolute -bottom-0.5 -right-0.5">
        <div className="relative">
          <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          {isTyping && (
            <div className="absolute inset-0 w-3.5 h-3.5 bg-green-400 rounded-full animate-ping opacity-75" />
          )}
        </div>
      </div>
    </div>
  );
};

// Cursor component for typing effect
const TypingCursor: React.FC = () => (
  <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-blink" />
);

// Main StreamingMessage component
export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  text,
  isComplete = false,
  isThinking = false,
  className,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const textRef = useRef(text);
  const indexRef = useRef(0);

  // Handle streaming text animation
  useEffect(() => {
    if (isThinking) {
      setDisplayText('');
      indexRef.current = 0;
      return;
    }

    // If text changed significantly, reset
    if (text.length < textRef.current.length) {
      setDisplayText('');
      indexRef.current = 0;
    }

    textRef.current = text;

    // Animate new characters
    if (indexRef.current < text.length) {
      const timer = setInterval(() => {
        if (indexRef.current < textRef.current.length) {
          setDisplayText(textRef.current.slice(0, indexRef.current + 1));
          indexRef.current++;
        } else {
          clearInterval(timer);
        }
      }, 15); // 15ms per character for smooth typing

      return () => clearInterval(timer);
    }
  }, [text, isThinking]);

  // Handle cursor visibility
  useEffect(() => {
    if (isComplete) {
      setShowCursor(false);
    } else {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);
      return () => clearInterval(cursorInterval);
    }
  }, [isComplete]);

  if (isThinking) {
    return (
      <div className={cn('flex items-start gap-3', className)}>
        <AIAvatar isTyping />
        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%]">
          <ThinkingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 animate-in fade-in duration-300',
        className
      )}
    >
      <AIAvatar isTyping={!isComplete} />
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[85%] min-h-[2.5rem]">
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
          {displayText.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              {index < displayText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
          {!isComplete && showCursor && <TypingCursor />}
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;
