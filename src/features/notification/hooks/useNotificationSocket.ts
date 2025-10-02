import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  addRealTimeNotification,
  updateUnreadCount,
} from '../slices/notificationSlice';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { mapType } from '../types/notification-types';

export const useNotificationSocket = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notification);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    // Initialize socket connection
    socketRef.current = io(
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:8099',
      {
        auth: {
          userId: user._id,
        },
      }
    );

    const socket = socketRef.current;

    // Join user room khi kết nối thành công
    socket.on('connect', () => {
      // console.log('Socket connected:', socket.id);
      // console.log('Joining room for user:', user._id);
      socket.emit('join', { userId: user._id });
    });

    // Log disconnect
    socket.on('disconnect', () => {
      // console.log('Socket disconnected');
    });

    // Listen for new notifications
    socket.on(
      'notifications',
      (notification: {
        _id: string;
        title: string;
        body?: string;
        deepLink?: string;
        type: string;
        createdAt: string;
        createdBy?: string;
      }) => {
        // console.log('Received notification:', notification);
        // console.log('Current user ID:', user._id);
        // console.log('Notification created by:', notification.createdBy);

        // map incoming string type to the app's NotificationType (best-effort)

        dispatch(
          addRealTimeNotification({
            id: notification._id,
            title: notification.title,
            body: notification.body,
            deepLink: notification.deepLink,
            type: mapType(notification.type),
            isRead: false,
            createdAt: notification.createdAt,
          })
        );

        // Also update unread count
        dispatch(updateUnreadCount(unreadCount + 1));

        // Show toast notification (không hiển thị cho người gửi)
        // Kiểm tra xem user hiện tại có phải là người gửi không
        const isNotificationSender = notification.createdBy === user._id;
        // console.log('Is notification sender:', isNotificationSender);

        if (!isNotificationSender) {
          // Chỉ hiển thị toast cho người không phải là người gửi
          // console.log('Showing toast notification');
          toast.info('🔔 New notification', { icon: null });
        } else {
          // console.log('Not showing toast - user is sender');
        }
      }
    );

    // Listen for unread count updates
    socket.on('unreadCount', (count: number) => {
      dispatch(updateUnreadCount(count));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, dispatch, unreadCount]);

  return {
    socket: socketRef.current,
  };
};
