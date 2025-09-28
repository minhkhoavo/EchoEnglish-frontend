import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, Check, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} from '../services/notificationApi';

interface NotificationActionsProps {
  notificationId: string;
  isRead: boolean;
  deepLink?: string;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  hideActions?: boolean;
}

export const NotificationActions = ({
  notificationId,
  isRead,
  deepLink,
  onMarkAsRead,
  onDelete,
  hideActions = false,
}: NotificationActionsProps) => {
  const navigate = useNavigate();
  const [markAsReadMutation] = useMarkAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();

  const handleDeepLinkClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Đánh dấu đã đọc trước khi chuyển hướng
    if (!isRead) {
      await handleMarkAsRead();
    }

    if (deepLink) {
      navigate(deepLink);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markAsReadMutation(notificationId).unwrap();
      onMarkAsRead?.(notificationId);
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotificationMutation(notificationId).unwrap();
      onDelete?.(notificationId);
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  if (hideActions) return null;

  return (
    <div className="flex items-center gap-2 action-buttons">
      {/* Three dots menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-gray-100"
            title="More options"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {!isRead && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleMarkAsRead();
              }}
            >
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Mark as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
