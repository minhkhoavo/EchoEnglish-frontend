import { Clock, ExternalLink } from 'lucide-react';
import { NotificationIcon } from './NotificationIcon';
import type { NotificationType } from '../types/notification-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NotificationContentProps {
  title: string;
  body?: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  compact?: boolean;
  deepLink?: string;
  onViewClick?: () => void;
}

export const NotificationContent = ({
  title,
  body,
  type,
  isRead,
  createdAt,
  compact = false,
  deepLink,
  onViewClick,
}: NotificationContentProps) => {
  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationColors = (type: string, isRead: boolean) => {
    const colors = {
      info: {
        bg: isRead ? 'from-blue-50' : 'from-blue-100',
        iconBg: isRead ? 'bg-blue-100' : 'bg-blue-200',
        text: isRead ? 'text-blue-600' : 'text-blue-700',
        accent: 'border-l-blue-500',
      },
      promotion: {
        bg: isRead ? 'from-emerald-50' : 'from-emerald-100',
        iconBg: isRead ? 'bg-emerald-100' : 'bg-emerald-200',
        text: isRead ? 'text-emerald-600' : 'text-emerald-700',
        accent: 'border-l-emerald-500',
      },
      warning: {
        bg: isRead ? 'from-amber-50' : 'from-amber-100',
        iconBg: isRead ? 'bg-amber-100' : 'bg-amber-200',
        text: isRead ? 'text-amber-600' : 'text-amber-700',
        accent: 'border-l-amber-500',
      },
      payment: {
        bg: isRead ? 'from-violet-50' : 'from-violet-100',
        iconBg: isRead ? 'bg-violet-100' : 'bg-violet-200',
        text: isRead ? 'text-violet-600' : 'text-violet-700',
        accent: 'border-l-violet-500',
      },
      system: {
        bg: isRead ? 'from-slate-50' : 'from-slate-100',
        iconBg: isRead ? 'bg-slate-100' : 'bg-slate-200',
        text: isRead ? 'text-slate-600' : 'text-slate-700',
        accent: 'border-l-slate-500',
      },
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const colors = getNotificationColors(type, isRead);

  return (
    <TooltipProvider>
      <div className="flex items-start gap-4 w-full pr-4">
        {/* Notification type icon */}
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${colors.iconBg} ${colors.text} shadow-md border border-white/50`}
        >
          <NotificationIcon type={type} className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 w-full">
          {/* Title */}
          <h4
            className={`text-sm mb-2 line-clamp-2 transition-all ${
              !isRead
                ? 'text-gray-900 font-semibold'
                : 'text-gray-700 font-medium'
            }`}
          >
            {title}
          </h4>

          {/* Body content if available */}
          {body && (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <p
                  className={`text-xs mb-3 line-clamp-2 cursor-help ${
                    !isRead ? 'text-gray-800 font-medium' : 'text-gray-600'
                  }`}
                >
                  {body}
                </p>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="center"
                sideOffset={8}
                className="max-w-lg w-auto min-w-[200px] max-h-[400px] overflow-y-auto px-4 py-3 text-sm leading-relaxed shadow-xl border-2"
              >
                <p className="whitespace-pre-wrap break-words">{body}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Timestamp and View button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatTime(createdAt)}</span>
              {!isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
            </div>

            {/* View button on same line */}
            {deepLink && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewClick?.();
                }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors px-2 py-1 hover:bg-blue-50 rounded"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
