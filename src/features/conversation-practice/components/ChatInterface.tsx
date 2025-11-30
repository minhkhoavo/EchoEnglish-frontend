import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import {
  Send,
  Mic,
  MicOff,
  Keyboard,
  Volume2,
  VolumeX,
  Bot,
  User,
  Loader2,
  StopCircle,
} from 'lucide-react';
import type { ChatMessage } from '../types';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  inputMode: 'text' | 'voice';
  onInputModeChange: (mode: 'text' | 'voice') => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  disabled?: boolean;
  feedback?: string | null;
  onClearFeedback?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isTyping,
  inputMode,
  onInputModeChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
  feedback,
  onClearFeedback,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Track which messages have been auto-played to prevent duplicate playback
  const playedMessagesRef = useRef<Set<string>>(new Set());

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when in text mode - use requestAnimationFrame for reliable focus
  useEffect(() => {
    if (inputMode === 'text' && inputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [inputMode, disabled, isTyping]);

  const handleSend = useCallback(() => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  }, [inputValue, onSendMessage, disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeak = useCallback(
    (text: string) => {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();

        if (isSpeaking) {
          setIsSpeaking(false);
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
    },
    [isSpeaking]
  );

  // Auto-play assistant messages (only once per message)
  useEffect(() => {
    if (messages.length > 0 && !isTyping) {
      const lastMessage = messages[messages.length - 1];
      // Create unique ID for the message based on content and timestamp
      const messageId = `${lastMessage.timestamp || ''}-${lastMessage.content.substring(0, 50)}`;

      if (
        lastMessage.role === 'assistant' &&
        !playedMessagesRef.current.has(messageId)
      ) {
        // Mark as played immediately to prevent duplicate plays
        playedMessagesRef.current.add(messageId);

        // Small delay to ensure UI is updated
        const timer = setTimeout(() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(lastMessage.content);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [messages, isTyping]);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <Avatar
                className={cn(
                  'w-9 h-9 flex-shrink-0 flex items-center justify-center',
                  message.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </Avatar>

              {/* Message Bubble */}
              <div
                className={cn(
                  'group relative max-w-[75%] rounded-2xl px-4 py-3 shadow-sm',
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-md'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-tl-md'
                )}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div
                  className={cn(
                    'flex items-center gap-2 mt-2 text-xs',
                    message.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  )}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(message.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                      title={isSpeaking ? 'Stop speaking' : 'Listen'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <Avatar className="w-9 h-9 flex-shrink-0 bg-slate-800 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </Avatar>
              <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Feedback Display */}
          {feedback && (
            <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-emerald-700 font-medium">
                  {feedback}
                </span>
              </div>
              {onClearFeedback && (
                <button
                  onClick={onClearFeedback}
                  className="text-emerald-500 hover:text-emerald-700 p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <Button
              variant={inputMode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onInputModeChange('text')}
              className={cn(
                'gap-2 rounded-full px-4',
                inputMode === 'text'
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Keyboard className="w-4 h-4" />
              Type
            </Button>
            <Button
              variant={inputMode === 'voice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onInputModeChange('voice')}
              className={cn(
                'gap-2 rounded-full px-4',
                inputMode === 'voice'
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Mic className="w-4 h-4" />
              Speak
            </Button>
          </div>

          {/* Text Input Mode */}
          {inputMode === 'text' && (
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                placeholder="Type your message..."
                disabled={disabled}
                autoFocus
                className="flex-1 rounded-full px-5 py-6 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || disabled}
                size="lg"
                className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Voice Input Mode */}
          {inputMode === 'voice' && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
                )}
                <Button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  disabled={disabled}
                  size="lg"
                  className={cn(
                    'relative rounded-full w-20 h-20 transition-all duration-200',
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 scale-110'
                      : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {isRecording ? (
                    <StopCircle className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-slate-500">
                {isRecording
                  ? 'Listening... Tap to stop'
                  : 'Tap the microphone to start speaking'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
