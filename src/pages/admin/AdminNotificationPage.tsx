import type { NotificationFormData } from '@/features/notification/types/notification.type';
import { AdminPanel } from '@/features/notification/components/AdminPanel';

const AdminNotificationPage = () => {
  const handleSendNotification = (data: NotificationFormData) => {
    console.log('Notification sent:', data);
    // The mutation will automatically update the cache
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notification Management</h1>
          <p className="text-muted-foreground">
            Send push notifications to users across the platform
          </p>
        </div>
      </div>

      <AdminPanel onSendNotification={handleSendNotification} />
    </div>
  );
};

export default AdminNotificationPage;
