import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, Shield, Bell } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { logout, resetApiState } from '@/features/auth/slices/authSlice';
import { useState } from 'react';
import {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
} from '@/features/notification/services/notificationApi';
import { NotificationDropdown } from '@/features/notification/components/NotificationDropdown';
import { useNotificationSocket } from '@/features/notification/hooks/useNotificationSocket';
import {
  setDropdownOpen,
  addRealTimeNotification,
  updateUnreadCount,
} from '@/features/notification/slices/notificationSlice';
import { useEffect } from 'react';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminHeader = ({
  sidebarOpen,
  setSidebarOpen,
}: AdminHeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isDropdownOpen, notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize WebSocket connection for real-time notifications
  useNotificationSocket();

  const { data: notificationsResponse, isFetching } =
    useGetUserNotificationsQuery({
      page: currentPage,
      limit: 9999,
    });
  const { data: unreadCountResponse } = useGetUnreadCountQuery();

  const displayNotifications =
    notifications.length > 0
      ? notifications
      : notificationsResponse?.data?.notifications || [];
  const displayUnreadCount =
    notifications.length > 0
      ? unreadCount
      : unreadCountResponse?.data?.count || 0;
  const pagination = notificationsResponse?.data?.pagination;

  const setIsDropdownOpen = (open: boolean) => {
    dispatch(setDropdownOpen(open));
    if (open) {
      setCurrentPage(1);
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (
      notificationsResponse?.data?.notifications &&
      notifications.length === 0
    ) {
      notificationsResponse.data.notifications.forEach((notification) => {
        dispatch(addRealTimeNotification(notification));
      });
    }
    if (
      unreadCountResponse?.data?.count !== undefined &&
      notifications.length === 0
    ) {
      dispatch(updateUnreadCount(unreadCountResponse.data.count));
    }
  }, [
    notificationsResponse,
    unreadCountResponse,
    notifications.length,
    unreadCount,
    dispatch,
  ]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetApiState());
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Admin Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  EchoEnglish Management
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Admin Badge */}
            <Badge
              variant="outline"
              className="hidden sm:flex border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/20"
            >
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Bell className="h-4 w-4" />
                {displayUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {displayUnreadCount > 99 ? '99+' : displayUnreadCount}
                  </span>
                )}
              </Button>

              <NotificationDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                notifications={displayNotifications}
                onLoadMore={handleLoadMore}
                hasMore={pagination?.hasNext}
                isLoading={isFetching && currentPage === 1}
                isLoadingMore={isFetching && currentPage > 1}
              />
            </div>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <UserAvatar
                    src={user?.image}
                    alt="Admin Avatar"
                    fallbackText={user?.fullName || 'A'}
                    size="xs"
                    showOnlineIndicator
                    className="relative z-10"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName || 'Admin'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'admin@echoenlish.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>User Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
