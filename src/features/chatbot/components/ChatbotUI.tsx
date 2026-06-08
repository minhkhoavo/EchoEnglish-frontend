import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { ChatbotAction, Citation } from '../types';

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

// CitationLink - Renders citation markers as clickable links
interface CitationLinkProps {
  citationId: number;
  citations?: Citation[];
}

const CitationLink: React.FC<CitationLinkProps> = ({
  citationId,
  citations,
}) => {
  const navigate = useNavigate();
  const citation = citations?.find((c) => c.id === citationId);

  if (!citation) {
    return <span className="text-blue-600">[{citationId}]</span>;
  }

  return (
    <button
      onClick={() => navigate(citation.url)}
      className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs font-semibold text-blue-600 bg-blue-100 hover:bg-blue-200 rounded transition-colors cursor-pointer"
      title={citation.title}
    >
      {citationId}
    </button>
  );
};

// Citations display component
interface CitationsDisplayProps {
  citations: Citation[];
}

export const CitationsDisplay: React.FC<CitationsDisplayProps> = ({
  citations,
}) => {
  const navigate = useNavigate();

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-2 font-medium">📚 Sources:</p>
      <div className="space-y-1.5">
        {citations.map((citation) => (
          <button
            key={citation.id}
            onClick={() => navigate(citation.url)}
            className="flex items-start gap-2 w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-blue-600 bg-blue-100 group-hover:bg-blue-200 rounded transition-colors">
              {citation.id}
            </span>
            <span className="text-sm text-gray-700 group-hover:text-blue-600 truncate transition-colors">
              {citation.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to parse text with citation markers
const parseTextWithCitations = (
  text: string,
  citations?: Citation[]
): React.ReactNode[] => {
  // Match [1], [2], etc.
  const parts = text.split(/(\[\d+\])/g);

  return parts.map((part, index) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const citationId = parseInt(match[1], 10);
      return (
        <CitationLink
          key={index}
          citationId={citationId}
          citations={citations}
        />
      );
    }
    return part;
  });
};

// MessageContent - Handles message rendering with markdown support
interface MessageContentProps {
  content: string;
  html?: string;
  images?: string[];
  variant?: 'user' | 'assistant';
  className?: string;
  citations?: Citation[];
}

export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  html,
  images,
  variant = 'assistant',
  className,
  citations,
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
                          {parseTextWithCitations(part.slice(2, -2), citations)}
                        </strong>
                      );
                    }
                    return parseTextWithCitations(part, citations);
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
                    {parseTextWithCitations(
                      line.trim().substring(1).trim(),
                      citations
                    )}
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
                  <span className="text-gray-700 leading-relaxed">
                    {parseTextWithCitations(text, citations)}
                  </span>
                </div>
              );
            }

            // Regular paragraph
            if (line.trim()) {
              return (
                <p key={index} className="mb-2 leading-relaxed">
                  {parseTextWithCitations(line, citations)}
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
        <div
          className={cn(
            'space-y-2',
            images.length > 1 && 'grid grid-cols-2 gap-2 space-y-0'
          )}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className={cn(
                  'w-full mx-auto block cursor-pointer hover:opacity-90 transition-opacity',
                  images.length === 1
                    ? 'max-w-sm'
                    : 'max-w-full aspect-square object-cover'
                )}
                loading="lazy"
                onClick={() => {
                  // Open image in new tab for full view
                  window.open(image, '_blank');
                }}
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

      {/* Citations Display */}
      {citations && citations.length > 0 && (
        <CitationsDisplay citations={citations} />
      )}
    </div>
  );
};
