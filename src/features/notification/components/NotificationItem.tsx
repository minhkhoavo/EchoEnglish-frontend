import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/core/store/store';
import { NotificationContent } from './NotificationContent';
import { NotificationActions } from './NotificationActions';
import {
  markNotificationAsRead,
  removeNotification,
} from '../slices/notificationSlice';
import type { Notification } from '../types/notification.type';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  isAdmin?: boolean;
  hideActions?: boolean;
}

export const NotificationItem = ({
  notification,
  compact = false,
  isAdmin = false,
  hideActions = false,
}: NotificationItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Removed handleCardClick - only View button should navigate

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleDelete = (id: string) => {
    dispatch(removeNotification(id));
  };

  const getNotificationColors = (type: string, isRead: boolean) => {
    const colors = {
      info: {
        bg: isRead ? 'from-blue-50' : 'from-blue-100',
        accent: 'border-l-blue-500',
      },
      promotion: {
        bg: isRead ? 'from-emerald-50' : 'from-emerald-100',
        accent: 'border-l-emerald-500',
      },
      warning: {
        bg: isRead ? 'from-amber-50' : 'from-amber-100',
        accent: 'border-l-amber-500',
      },
      payment: {
        bg: isRead ? 'from-violet-50' : 'from-violet-100',
        accent: 'border-l-violet-500',
      },
      system: {
        bg: isRead ? 'from-slate-50' : 'from-slate-100',
        accent: 'border-l-slate-500',
      },
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const colors = getNotificationColors(notification.type, notification.isRead);

  return (
    <div
      className={`p-4 transition-all duration-200 relative ${
        !notification.isRead
          ? `bg-gradient-to-r ${colors.bg} to-white border-l-4 ${colors.accent} shadow-sm`
          : 'bg-white'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full width notification content */}
      <div className="w-full">
        <NotificationContent
          title={notification.title}
          body={notification.body}
          type={notification.type}
          isRead={notification.isRead}
          createdAt={notification.createdAt}
          compact={compact}
          deepLink={notification.deepLink}
          onViewClick={() => {
            if (!notification.isRead) {
              dispatch(markNotificationAsRead(notification.id));
            }
            if (notification.deepLink) {
              navigate(notification.deepLink);
            }
          }}
        />
      </div>

      {/* Actions positioned at top right */}
      <div className="absolute top-2 right-2">
        <NotificationActions
          notificationId={notification.id}
          isRead={notification.isRead}
          deepLink={notification.deepLink}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          hideActions={hideActions}
        />
      </div>
    </div>
  );
};
