import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Notification,
  NotificationState,
} from '../types/notification.type';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isDropdownOpen: false,
  isLoading: false,
  hasMore: true,
  currentPage: 1,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setDropdownOpen: (state, action: PayloadAction<boolean>) => {
      state.isDropdownOpen = action.payload;
    },
    addRealTimeNotification: (state, action: PayloadAction<Notification>) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    resetPagination: (state) => {
      state.currentPage = 1;
      state.hasMore = true;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setHasMore: (state, action: PayloadAction<boolean>) => {
      state.hasMore = action.payload;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload
      );
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
  },
});

export const {
  setDropdownOpen,
  addRealTimeNotification,
  updateUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  resetPagination,
  setCurrentPage,
  setHasMore,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
