import type { NotificationFormData } from '@/features/notification/types/notification.type';
import { AdminPanel } from '@/features/notification/components/AdminPanel';

const AdminNotificationPage = () => {
  const handleSendNotification = (data: NotificationFormData) => {
    console.log('Notification sent:', data);
    // The mutation will automatically update the cache
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Notification Management
              </h1>
              <p className="text-gray-600 mt-1">
                Send push notifications to users across the platform
              </p>
            </div>
          </div>
        </div>

        <AdminPanel onSendNotification={handleSendNotification} />
      </div>
    </div>
  );
};

export default AdminNotificationPage;
