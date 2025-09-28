import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  ChatbotResponse,
  ChatbotAction,
  NoticePayload,
  ListPayload,
  DetailPayload,
  ResultPayload,
  HtmlEmbedPayload,
} from '../types';
import { ActionButtons } from './ChatbotUI';

interface LayoutProps {
  response: ChatbotResponse;
  onExecuteAction: (action: ChatbotAction) => void;
}

// Notice Layout - For alerts, notifications, status messages
export const NoticeLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'notice') return null;

  const payload = response.payload as NoticePayload;
  if (!payload) return null;

  return (
    <Card
      className={cn(
        'p-4 border-l-4',
        payload.status === 'success' && 'border-l-green-500 bg-green-50/50',
        payload.status === 'warning' && 'border-l-yellow-500 bg-yellow-50/50',
        payload.status === 'error' && 'border-l-red-500 bg-red-50/50',
        payload.status === 'info' && 'border-l-blue-500 bg-blue-50/50'
      )}
    >
      {payload.title && (
        <h3 className="font-semibold text-gray-900 mb-1">{payload.title}</h3>
      )}
      {payload.subtitle && (
        <p className="text-sm text-gray-600 mb-2">{payload.subtitle}</p>
      )}
      <ActionButtons
        actions={response.actions || []}
        onExecute={onExecuteAction}
      />
    </Card>
  );
};

// List Layout - For displaying lists of items
export const ListLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'list') return null;

  const payload = response.payload as ListPayload;
  if (!payload || !payload.items) return null;

  return (
    <div className="space-y-3">
      {payload.title && (
        <h3 className="font-semibold text-gray-900 mb-3">{payload.title}</h3>
      )}
      {payload.items.map((item, index) => (
        <Card key={index} className="p-3 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {item.item_actions && item.item_actions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.item_actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      onClick={() => onExecuteAction(action)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {item.right_label && (
              <Badge variant="outline" className="ml-2 text-xs">
                {item.right_label}
              </Badge>
            )}
          </div>
        </Card>
      ))}
      <ActionButtons
        actions={response.actions || []}
        onExecute={onExecuteAction}
      />
    </div>
  );
};

// Detail Layout - For displaying detailed information with properties
export const DetailLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'detail') return null;

  const payload = response.payload as DetailPayload;
  if (!payload) return null;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-4">
      {payload.headline && (
        <h3 className="font-semibold text-gray-900 mb-3">{payload.headline}</h3>
      )}
      {payload.properties && payload.properties.length > 0 && (
        <dl className="grid grid-cols-2 gap-2 mb-4">
          {payload.properties.map((pair, index) => (
            <div key={index}>
              <dt className="text-sm font-medium text-gray-600">
                {pair.label}
              </dt>
              <dd className="text-sm text-gray-900">{pair.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {payload.badge && (
        <Badge
          className={cn('flex-shrink-0', getBadgeColor(payload.badge.type))}
        >
          {payload.badge.text}
        </Badge>
      )}
      {payload.note && (
        <p className="text-sm text-gray-600 mt-3 italic">{payload.note}</p>
      )}
      <ActionButtons
        actions={response.actions || []}
        onExecute={onExecuteAction}
      />
    </Card>
  );
};

// Result Layout - For displaying results with achievements, summaries
export const ResultLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'result') return null;

  const payload = response.payload as ResultPayload;
  if (!payload) return null;

  return (
    <Card className="p-4">
      {payload.headline && (
        <h3
          className={cn(
            'font-semibold mb-3',
            payload.status === 'success' && 'text-green-700',
            payload.status === 'warning' && 'text-yellow-700',
            payload.status === 'error' && 'text-red-700'
          )}
        >
          {payload.headline}
        </h3>
      )}
      {payload.summary_points && payload.summary_points.length > 0 && (
        <ul className="space-y-1 mb-3">
          {payload.summary_points.map((point, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
              {point}
            </li>
          ))}
        </ul>
      )}
      {payload.next_steps && payload.next_steps.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-800 mb-2">Next Steps:</h4>
          <ol className="space-y-1">
            {payload.next_steps.map((step, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 flex items-start"
              >
                <span className="bg-blue-100 text-blue-700 text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
      <ActionButtons
        actions={response.actions || []}
        onExecute={onExecuteAction}
      />
    </Card>
  );
};

// HTML Embed Layout - For embedding HTML content
export const HtmlEmbedLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'html_embed') return null;

  const payload = response.payload as HtmlEmbedPayload;
  if (!payload || !payload.html) return null;

  const height = payload.height_hint || 300;

  return (
    <div className="space-y-4">
      {/* Title */}
      {payload.title && (
        <h3 className="text-lg font-semibold text-gray-900">{payload.title}</h3>
      )}

      {/* HTML Embed */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="w-full bg-white" style={{ height: `${height}px` }}>
          <iframe
            srcDoc={payload.html}
            className="w-full h-full border-0"
            title="Embedded Content"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>

      {/* Fallback Text */}
      {payload.fallback_text && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Alternative Content
            </span>
          </div>
          <p className="text-yellow-700 text-sm">{payload.fallback_text}</p>
        </div>
      )}

      <ActionButtons
        actions={response.actions || []}
        onExecute={onExecuteAction}
      />
    </div>
  );
};
