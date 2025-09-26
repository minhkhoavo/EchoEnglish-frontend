import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatbotAction } from '../types';

// ActionButtons - Reusable button group component
interface ActionButtonsProps {
  actions?: ChatbotAction[];
  onExecute: (action: ChatbotAction) => void;
  variant?: 'default' | 'compact';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  actions,
  onExecute,
  variant = 'default',
}) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        variant === 'default' && 'mt-3',
        variant === 'compact' && 'mt-2'
      )}
    >
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={() => onExecute(action)}
          size={variant === 'compact' ? 'sm' : 'sm'}
          variant="outline"
          className={cn(
            'rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 chatbot-button',
            action.confirm && 'border-red-200 text-red-700 hover:bg-red-50',
            !action.confirm &&
              'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

// MessageContent - Handles message rendering with markdown support
interface MessageContentProps {
  content: string;
  html?: string;
  images?: string[];
  variant?: 'user' | 'assistant';
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  html,
  images,
  variant = 'assistant',
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Text Content */}
      {content && !html && (
        <div
          className={cn(
            'prose prose-sm max-w-none',
            variant === 'user' ? 'text-gray-800' : 'text-gray-700'
          )}
        >
          {content.split('\n').map((line, index) => {
            // Handle bold text **text**
            if (line.includes('**')) {
              const parts = line.split(/(\*\*[^*]+\*\*)/);
              return (
                <p key={index} className="mb-2 leading-relaxed">
                  {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong
                          key={partIndex}
                          className="font-semibold text-gray-900"
                        >
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }

            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={index} className="flex items-start gap-2 mb-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">
                    {line.trim().substring(1).trim()}
                  </span>
                </div>
              );
            }

            // Handle numbered lists
            if (/^\d+\./.test(line.trim())) {
              const [, number, text] =
                line.trim().match(/^(\d+)\.\s*(.*)/) || [];
              return (
                <div key={index} className="flex items-start gap-3 mb-1">
                  <span className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">
                    {number}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{text}</span>
                </div>
              );
            }

            // Regular paragraph
            if (line.trim()) {
              return (
                <p key={index} className="mb-2 leading-relaxed">
                  {line}
                </p>
              );
            }

            // Empty line for spacing
            return <div key={index} className="h-2" />;
          })}
        </div>
      )}

      {/* HTML Content */}
      {html && (
        <div
          className={cn(
            'prose prose-sm max-w-none',
            'prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700',
            'prose-strong:text-gray-900 prose-em:text-gray-700',
            'prose-blue prose-a:text-blue-600 hover:prose-a:text-blue-700'
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}

      {/* Images */}
      {images && images.length > 0 && (
        <div className="space-y-2">
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full max-w-sm mx-auto block"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0MkM4NyA0NC4yMDkxIDg1LjIwOTEgNDYgODMgNDZDODAuNzkwOSA0NiA3OSA0NC4yMDkxIDc5IDQyQzc5IDM5Ljc5MDkgODAuNzkwOSAzOCA4MyAzOEM4NS4yMDkxIDM4IDg3IDM5Ljc5MDkgODcgNDJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik05NyA1OUw4NyA0OUw3NyA1OUw4NyA2OUw5NyA1OVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  target.alt = 'Image failed to load';
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
