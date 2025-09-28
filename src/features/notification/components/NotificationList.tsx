import { useRef } from 'react';
import { Bell, Mail, Loader2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../types/notification.type';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const NotificationList = ({
  notifications,
  isLoading = false,
  emptyIcon = <Bell className="h-8 w-8 opacity-50" />,
  emptyTitle = 'No notifications',
  emptyDescription = "You're all caught up!",
}: NotificationListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm">Loading notifications...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="p-3 bg-gray-50 rounded-full w-fit mx-auto mb-3">
          {emptyIcon}
        </div>
        <p className="text-sm font-medium">{emptyTitle}</p>
        <p className="text-xs text-gray-400 mt-1">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="max-h-[500px] overflow-y-auto  ">
      {notifications.map((notification, index) => (
        <div key={notification.id}>
          <NotificationItem notification={notification} compact={true} />
          {index < notifications.length - 1 && (
            <div className="border-t border-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
};
