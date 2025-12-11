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
import {
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Crown,
  BookOpen,
  Bell,
  Search,
  Coins,
  CreditCard,
  History,
} from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { logout, resetApiState } from '@/features/auth/slices/authSlice';
import { useEffect, useState } from 'react';
import { useGetUserBalanceQuery } from '@/features/payment/services/paymentApi';
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

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isDropdownOpen, notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Initialize WebSocket connection for real-time notifications
  useNotificationSocket();

  const { data: userBalanceResponse } = useGetUserBalanceQuery();
  // Still get notifications from API on initial load
  const { data: notificationsResponse, isFetching } =
    useGetUserNotificationsQuery({
      page: currentPage,
      limit: 9999,
    });
  const { data: unreadCountResponse } = useGetUnreadCountQuery();

  const userBalance = userBalanceResponse?.data;
  // Use Redux state for notifications and unread count, fallback to API data
  const displayNotifications =
    notifications.length > 0
      ? notifications
      : notificationsResponse?.data?.notifications || [];
  // Always use Redux unreadCount if notifications are loaded from Redux, otherwise use API data
  const displayUnreadCount =
    notifications.length > 0
      ? unreadCount
      : unreadCountResponse?.data?.count || 0;
  const pagination = notificationsResponse?.data?.pagination;

  const setIsDropdownOpen = (open: boolean) => {
    dispatch(setDropdownOpen(open));
    if (open) {
      setCurrentPage(1); // Reset to first page when opening
    }
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // Sync API data to Redux state when component loads
    if (
      notificationsResponse?.data?.notifications &&
      notifications.length === 0
    ) {
      // If Redux state is empty but we have API data, sync it
      notificationsResponse.data.notifications.forEach((notification) => {
        dispatch(addRealTimeNotification(notification));
      });
    }
    // Only sync unread count if Redux state is not initialized yet
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
    window.location.href = '/login';
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

            {/* Brand Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  EchoEnglish
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  AI-Powered Learning
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Token Balance */}
            {userBalance && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center space-x-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => navigate('/payment')}
              >
                <Coins className="h-4 w-4" />
                <span className="font-medium">
                  {userBalance.credits.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs">credits</span>
              </Button>
            )}

            {/* Premium Badge */}
            {/* <Badge
              variant="outline"
              className="hidden sm:flex border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:bg-amber-900/20"
            >
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge> */}

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
                    alt="User Avatar"
                    fallbackText={user?.fullName || 'U'}
                    size="xs"
                    showOnlineIndicator
                    className="relative z-10"
                    ringClassName="ring-0"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/payment')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Buy Tokens</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/payment/history')}
                >
                  <History className="mr-2 h-4 w-4" />
                  <span>Transaction History</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate('/me/tests')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>My Learning</span>
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
