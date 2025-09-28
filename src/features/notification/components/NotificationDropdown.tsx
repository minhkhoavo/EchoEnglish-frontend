import { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCheck, Loader2, Inbox, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useMarkAllAsReadMutation } from '../services/notificationApi';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { NotificationList } from './NotificationList';
import type { Notification } from '../types/notification.type';
import { useAppDispatch } from '@/core/store/store';
import { markAllNotificationsAsRead } from '../slices/notificationSlice';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
}

export const NotificationDropdown = ({
  isOpen,
  onClose,
  notifications,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  isLoadingMore = false,
}: NotificationDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [markAllAsRead, { isLoading: isMarkingAllAsRead }] =
    useMarkAllAsReadMutation();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside dropdown AND not on a dropdown menu item
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        // Don't close if clicking on dropdown menu items or portals
        !(target.closest && target.closest('[role="menu"]')) &&
        !(
          target.closest &&
          target.closest('[data-radix-popper-content-wrapper]')
        ) &&
        !(target.closest && target.closest('.action-buttons'))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAllAsRead = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await markAllAsRead().unwrap();
      // Update local Redux state
      dispatch(markAllNotificationsAsRead());
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  if (!isOpen) return null;

  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadNotifications = sortedNotifications.filter(
    (notif) => !notif.isRead
  );
  const unreadCount = unreadNotifications.length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-[400px] z-50 animate-fade-in"
    >
      <Card className="shadow-2xl border border-gray-200 bg-white overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Notifications</span>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium hover:bg-white/80 transition-colors"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllAsRead}
              >
                {isMarkingAllAsRead ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <CheckCheck className="h-3 w-3 mr-1" />
                )}
                Mark all read
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}
          >
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                All ({sortedNotifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <NotificationList
                notifications={sortedNotifications}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="unread" className="mt-0">
              <NotificationList
                notifications={unreadNotifications}
                isLoading={false}
                emptyIcon={<Mail className="h-8 w-8 opacity-50" />}
                emptyTitle="No unread notifications"
                emptyDescription="All caught up!"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
