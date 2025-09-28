import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import type { NotificationFormData } from '@/features/notification/types/notification.type';
import { AdminPanel } from '@/features/notification/components/AdminPanel';

const AdminNotificationPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendNotification = (data: NotificationFormData) => {
    console.log('Notification sent:', data);
    // The mutation will automatically update the cache
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Include Header with notification bell for admin */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content - Centered and balanced */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <AdminPanel onSendNotification={handleSendNotification} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationPage;
