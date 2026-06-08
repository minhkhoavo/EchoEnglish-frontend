import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
} from 'lucide-react';
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

// Status icons mapping
const STATUS_ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

// Notice Layout - For alerts, notifications, status messages
export const NoticeLayout: React.FC<LayoutProps> = ({
  response,
  onExecuteAction,
}) => {
  if (response.layout !== 'notice') return null;

  const payload = response.payload as NoticePayload;
  if (!payload) return null;

  const StatusIcon = STATUS_ICONS[payload.status] || Info;

  return (
    <Card
      className={cn(
        'p-4 border-l-4 chatbot-layout-card overflow-hidden relative',
        payload.status === 'success' &&
          'border-l-green-500 bg-gradient-to-r from-green-50 to-white',
        payload.status === 'warning' &&
          'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white',
        payload.status === 'error' &&
          'border-l-red-500 bg-gradient-to-r from-red-50 to-white',
        payload.status === 'info' &&
          'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
      )}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-current to-transparent" />
      </div>

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 p-2 rounded-xl',
            payload.status === 'success' && 'bg-green-100 text-green-600',
            payload.status === 'warning' && 'bg-yellow-100 text-yellow-600',
            payload.status === 'error' && 'bg-red-100 text-red-600',
            payload.status === 'info' && 'bg-blue-100 text-blue-600'
          )}
        >
          <StatusIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {payload.title && (
            <h3 className="font-semibold text-gray-900 mb-1">
              {payload.title}
            </h3>
          )}
          {payload.subtitle && (
            <p className="text-sm text-gray-600">{payload.subtitle}</p>
          )}
        </div>
      </div>
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
    <div className="space-y-3 chatbot-layout-card">
      {payload.title && (
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">{payload.title}</h3>
        </div>
      )}
      {payload.items.map((item, index) => (
        <Card
          key={index}
          className={cn(
            'p-3 hover:shadow-lg transition-all duration-300 cursor-pointer group',
            'hover:border-blue-200 hover:-translate-y-0.5',
            'chatbot-layout-list-item'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {item.item_actions && item.item_actions.length > 0 && (
                <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.item_actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      onClick={() => onExecuteAction(action)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            {item.right_label && (
              <Badge
                variant="outline"
                className="ml-2 text-xs flex-shrink-0 bg-gradient-to-r from-gray-50 to-gray-100"
              >
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
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-0';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-0';
      case 'error':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-0';
      case 'info':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-0';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-0';
    }
  };

  return (
    <Card className="p-4 chatbot-layout-card overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        {payload.headline && (
          <h3 className="font-semibold text-lg text-gray-900 gradient-text">
            {payload.headline}
          </h3>
        )}
        {payload.badge && (
          <Badge
            className={cn(
              'flex-shrink-0 ml-2',
              getBadgeColor(payload.badge.type)
            )}
          >
            {payload.badge.text}
          </Badge>
        )}
      </div>

      {payload.properties && payload.properties.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 mb-4">
          {payload.properties.map((pair, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-50 to-white p-2 rounded-lg chatbot-layout-list-item"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {pair.label}
              </dt>
              <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                {pair.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {payload.note && (
        <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">{payload.note}</p>
        </div>
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

  const StatusIcon = STATUS_ICONS[payload.status] || CheckCircle2;

  return (
    <Card className="p-4 chatbot-layout-card overflow-hidden relative">
      {/* Success confetti effect for success status */}
      {payload.status === 'success' && (
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-bl from-green-400 to-transparent rounded-full blur-2xl" />
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              'p-2 rounded-xl',
              payload.status === 'success' && 'bg-green-100 text-green-600',
              payload.status === 'warning' && 'bg-yellow-100 text-yellow-600',
              payload.status === 'error' && 'bg-red-100 text-red-600'
            )}
          >
            <StatusIcon className="w-6 h-6" />
          </div>
          {payload.headline && (
            <h3
              className={cn(
                'font-semibold text-lg',
                payload.status === 'success' && 'text-green-700',
                payload.status === 'warning' && 'text-yellow-700',
                payload.status === 'error' && 'text-red-700'
              )}
            >
              {payload.headline}
            </h3>
          )}
        </div>

        {payload.summary_points && payload.summary_points.length > 0 && (
          <ul className="space-y-2 mb-4">
            {payload.summary_points.map((point, index) => (
              <li
                key={index}
                className="flex items-start chatbot-layout-list-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {payload.next_steps && payload.next_steps.length > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Next Steps
            </h4>
            <ol className="space-y-2">
              {payload.next_steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start chatbot-layout-list-item"
                  style={{
                    animationDelay: `${(payload.summary_points?.length || 0) * 50 + index * 50}ms`,
                  }}
                >
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <ActionButtons
          actions={response.actions || []}
          onExecute={onExecuteAction}
        />
      </div>
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
    <div className="space-y-4 chatbot-layout-card">
      {/* Title */}
      {payload.title && (
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          {payload.title}
        </h3>
      )}

      {/* HTML Embed */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
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
