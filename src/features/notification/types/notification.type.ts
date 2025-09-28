import { NotificationType } from './notification-types';

export interface Notification {
  id: string;
  title: string;
  body?: string;
  deepLink?: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationFormData {
  title: string;
  body?: string;
  deepLink?: string;
  type: NotificationType;
  userIds?: string[]; // Empty array means broadcast to all users
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isDropdownOpen: boolean;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
}
