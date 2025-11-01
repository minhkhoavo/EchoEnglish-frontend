import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Minimize2,
  Send,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type {
  ChatMessage,
  ChatbotCommand,
  ChatbotResponse,
  ChatbotAction,
} from '../types';
import { MessageContent } from './ChatbotUI';
import {
  NoticeLayout,
  ListLayout,
  DetailLayout,
  ResultLayout,
  HtmlEmbedLayout,
} from './ChatbotLayouts';
import '../styles/chatbot.css';

interface ChatBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSendMessage: (message: string, images?: string[]) => void;
  onExecuteCommand: (command: ChatbotCommand) => void;
  messages: ChatMessage[];
  isTyping: boolean;
  className?: string;
}

// Helper function to render UI Contract v0.2 responses
const renderUIContract = (
  response: ChatbotResponse,
  onExecuteCommand: (command: ChatbotCommand) => void
): React.ReactNode => {
  // Convert action to command for execution
  const executeAction = (action: ChatbotAction) => {
    const command: ChatbotCommand = {
      action: action.type,
      payload: {
        ...(action.type === 'OPEN_URL' && { href: action.href }),
        ...(action.type === 'NAVIGATE' && {
          route: action.route,
          args: action.args,
        }),
        ...(action.type === 'RUN_TOOL' && {
          tool: action.tool,
          args: action.args,
        }),
      },
      buttonText: action.label,
      confirmationRequired: action.confirm,
    };
    onExecuteCommand(command);
  };

  const layoutProps = {
    response,
    onExecuteAction: executeAction,
  };

  switch (response.layout) {
    case 'notice':
      return <NoticeLayout {...layoutProps} />;
    case 'list':
      return <ListLayout {...layoutProps} />;
    case 'detail':
      return <DetailLayout {...layoutProps} />;
    case 'result':
      return <ResultLayout {...layoutProps} />;
    case 'html_embed':
      return <HtmlEmbedLayout {...layoutProps} />;
    default:
      return null;
  }
};

const ChatBubble: React.FC<ChatBubbleProps> = ({
  isOpen,
  onToggle,
  onClose,
  onSendMessage,
  onExecuteCommand,
  messages,
  isTyping,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputValue.trim() || pendingImages.length > 0) {
      onSendMessage(
        inputValue.trim(),
        pendingImages.length > 0 ? pendingImages : undefined
      );
      setInputValue('');
      setPendingImages([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle clipboard paste for images
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageFiles = items.filter((item) => item.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validImagePromises = imageFiles
        .map((item) => {
          const file = item.getAsFile();
          if (file && file.size <= maxSize) {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            });
          }
          return null;
        })
        .filter((promise): promise is Promise<string> => promise !== null);

      if (validImagePromises.length > 0) {
        const images = await Promise.all(validImagePromises);
        setPendingImages((prev) => [...prev, ...images]);
      }
    }
  };

  // Handle drag and drop for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validFiles = files.filter((file) => file.size <= maxSize);

      if (validFiles.length > 0) {
        const imagePromises = validFiles.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        });

        const images = await Promise.all(imagePromises);
        setPendingImages((prev) => [...prev, ...images]);
      }
    }
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) {
    return (
      <div
        className={cn('fixed z-[9999]', className)}
        style={{ bottom: '1rem', right: '1rem' }}
      >
        <div className="relative chatbot-float">
          <Button
            onClick={onToggle}
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 group chatbot-button"
            style={{ cursor: 'pointer', pointerEvents: 'auto', zIndex: 9999 }}
          >
            <MessageCircle className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
          </Button>
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 animate-pulse"></div>
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center notification-pulse">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'fixed z-50 w-96 h-[500px] shadow-2xl flex flex-col backdrop-blur-sm bg-white/95 border-0 rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <div className="relative">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white shadow-sm">
              <div className="h-full w-full bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">EchoEnglish AI</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Online • Typing fast
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          <Button
            onClick={onToggle}
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 text-white hover:bg-red-500/20 rounded-xl transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className={cn(
          'flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white chatbot-scroll',
          dragOver &&
            'bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-lg'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            <div className="mb-6 relative">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✨</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Welcome to EchoEnglish AI!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              How can I help you with your TOEIC preparation today?
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">
                Try: "Show my progress"
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Try: "I want to upgrade"
              </Badge>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessageComponent
            key={message.id}
            message={message}
            onExecuteCommand={onExecuteCommand}
          />
        ))}

        {isTyping && (
          <div className="flex items-start space-x-3 mb-4 animate-in fade-in slide-in-from-left duration-500">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-[80%] message-bubble">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full chatbot-typing-dot"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full chatbot-typing-dot"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full chatbot-typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        {dragOver && (
          <div className="absolute inset-4 flex items-center justify-center bg-gradient-to-br from-blue-50/95 to-purple-50/95 backdrop-blur-sm rounded-2xl border-2 border-dashed border-blue-300">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-blue-600 font-semibold text-lg">
                Drop images here
              </p>
              <p className="text-blue-500 text-sm">Or paste from clipboard</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Image Preview */}
      {pendingImages.length > 0 && (
        <div className="px-4 py-3 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <p className="text-xs text-gray-600 mb-2 font-medium">
            Images to send:
          </p>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {pendingImages.map((image, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-16 h-16 object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                </div>
                <Button
                  onClick={() => removeImage(index)}
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Type your message..."
              className="pr-12 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all duration-200"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200 rounded-xl"
            >
              <Paperclip className="h-4 w-4 text-gray-500" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                if (e.target.files) {
                  const files = Array.from(e.target.files);

                  // Validate file size (max 5MB per file)
                  const maxSize = 5 * 1024 * 1024; // 5MB
                  const validFiles = files.filter((file) => {
                    if (file.size > maxSize) {
                      console.warn(
                        `File ${file.name} is too large. Max size is 5MB.`
                      );
                      // You could show a toast notification here
                      return false;
                    }
                    return true;
                  });

                  if (validFiles.length > 0) {
                    const imagePromises = validFiles.map((file) => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) =>
                          resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                      });
                    });
                    const images = await Promise.all(imagePromises);
                    setPendingImages((prev) => [...prev, ...images]);
                  }
                }
                e.target.value = '';
              }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() && pendingImages.length === 0}
            size="sm"
            className="h-12 w-12 p-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Chat Message Component
interface ChatMessageComponentProps {
  message: ChatMessage;
  onExecuteCommand: (command: ChatbotCommand) => void;
}

const ChatMessageComponent: React.FC<ChatMessageComponentProps> = ({
  message,
  onExecuteCommand,
}) => {
  const isUser = message.type === 'user';
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'flex mb-6 group animate-in fade-in slide-in-from-bottom duration-500',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] flex',
          isUser
            ? 'flex-row-reverse space-x-reverse space-x-2'
            : 'flex-row space-x-3'
        )}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        )}

        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center">
              <span className="text-white font-semibold text-sm">You</span>
            </div>
          </div>
        )}

        <div className="flex-1">
          {/* Message Bubble */}
          <div
            className={cn(
              'rounded-2xl px-4 py-2 relative shadow-sm border transition-all duration-200 group-hover:shadow-md message-bubble',
              isUser
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-tr-md text-white [&_*]:text-white'
                : 'bg-white text-gray-900 border-gray-200 rounded-tl-md hover:border-gray-300'
            )}
          >
            {/* Use MessageContent component */}
            <MessageContent
              content={message.content}
              html={message.html}
              images={message.images}
              variant={message.type}
            />
          </div>

          {/* UI Contract v0.2 Response */}
          {message.response && (
            <div className="mt-3">
              {renderUIContract(message.response, onExecuteCommand)}
            </div>
          )}

          {/* Timestamp and Status */}
          <div
            className={cn(
              'flex items-center justify-between mt-2 px-1',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
