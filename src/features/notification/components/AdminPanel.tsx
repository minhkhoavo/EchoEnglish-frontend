import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Users,
  User,
  Gift,
  AlertTriangle,
  CreditCard,
  Settings,
  Info,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useSendNotificationMutation,
  useGetUserListQuery,
} from '../services/notificationApi';
import { NotificationType } from '../types/notification-types';

interface AdminPanelProps {
  onSendNotification?: (data: {
    title: string;
    body?: string;
    deepLink?: string;
    type: NotificationType;
    userIds: string[];
  }) => void;
}

export const AdminPanel = ({ onSendNotification }: AdminPanelProps) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    deepLink: '',
    type: NotificationType.INFO as NotificationType,
    userIds: [] as string[],
    recipientType: 'all' as 'all' | 'specific',
  });

  const [userSearch, setUserSearch] = useState('');
  const [sendNotification, { isLoading }] = useSendNotificationMutation();
  const { data: userListResponse, isLoading: isLoadingUsers } =
    useGetUserListQuery({
      page: 1,
      limit: 9999, // Get enough users for selection
    });

  const users = useMemo(() => {
    return userListResponse?.data?.users || [];
  }, [userListResponse?.data?.users]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearch) return users;
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.fullName.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const typeIcons = {
    [NotificationType.INFO]: Info,
    [NotificationType.PROMOTION]: Gift,
    [NotificationType.WARNING]: AlertTriangle,
    [NotificationType.PAYMENT]: CreditCard,
    [NotificationType.SYSTEM]: Settings,
  };

  const typeColors = {
    [NotificationType.INFO]: 'bg-blue-500',
    [NotificationType.PROMOTION]: 'bg-green-500',
    [NotificationType.WARNING]: 'bg-orange-500',
    [NotificationType.PAYMENT]: 'bg-purple-500',
    [NotificationType.SYSTEM]: 'bg-gray-500',
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      userIds: checked
        ? [...prev.userIds, userId]
        : prev.userIds.filter((id) => id !== userId),
    }));
  };

  const handleSelectAll = () => {
    setFormData((prev) => ({
      ...prev,
      userIds:
        prev.userIds.length === filteredUsers.length
          ? []
          : filteredUsers.map((u) => u._id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter notification title');
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        deepLink: formData.deepLink.trim() || undefined,
        type: formData.type,
        userIds: formData.recipientType === 'all' ? [] : formData.userIds,
      };

      await sendNotification(payload).unwrap();

      const recipientCount =
        formData.recipientType === 'all'
          ? 'all users'
          : `${formData.userIds.length} users`;
      toast.success(`Notification sent to ${recipientCount} successfully!`);

      // Reset form
      setFormData({
        title: '',
        body: '',
        deepLink: '',
        type: NotificationType.INFO,
        userIds: [],
        recipientType: 'all',
      });
      setUserSearch('');

      // Call callback if provided
      onSendNotification?.(payload);
    } catch (error) {
      toast.error('Error occurred while sending notification');
      console.error('Error sending notification:', error);
    }
  };

  const TypeIcon = typeIcons[formData.type];

  return (
    <Card className="w-full shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Recipients Selection (3/5 width) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Recipient Selection */}
              <div className="space-y-4 p-5 bg-muted/30 rounded-lg border">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Recipients
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={
                      formData.recipientType === 'all' ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        recipientType: 'all',
                        userIds: [],
                      }))
                    }
                    className="flex items-center gap-2"
                  >
                    <Users className="h-3 w-3" />
                    All Users
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.recipientType === 'specific'
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        recipientType: 'specific',
                      }))
                    }
                    className="flex items-center gap-2"
                  >
                    <User className="h-3 w-3" />
                    Select Users
                  </Button>
                </div>

                {formData.recipientType === 'specific' && (
                  <div className="space-y-3 border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by email or name..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {formData.userIds.length === filteredUsers.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>

                    <ScrollArea className="h-48 border rounded">
                      <div className="p-2 space-y-2">
                        {isLoadingUsers ? (
                          <div className="text-center py-4 text-muted-foreground">
                            Loading user list...
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            {userSearch
                              ? 'No matching users found'
                              : 'No users available'}
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                            >
                              <Checkbox
                                checked={formData.userIds.includes(user._id)}
                                onCheckedChange={(checked) =>
                                  handleUserToggle(user._id, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {user.email}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {user.fullName}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    {formData.userIds.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Selected {formData.userIds.length} users
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Right Column - Form Fields & Preview (2/5 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notification Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TypeIcon className="h-4 w-4" />
                  Notification Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value as NotificationType,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(NotificationType).map((type) => {
                      const Icon = typeIcons[type];
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${typeColors[type]}`}>
                              <Icon className="h-3 w-3 text-white" />
                            </div>
                            <span className="capitalize">{type}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Enter notification title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="text-base"
                />
              </div>

              {/* Body */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Enter detailed content (optional)..."
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  rows={4}
                  className="text-base"
                />
              </div>

              {/* Deep Link */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Link (optional)</label>
                <Input
                  placeholder="/payment, /profile, ..."
                  value={formData.deepLink}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deepLink: e.target.value,
                    }))
                  }
                  className="text-base"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <Button
              type="submit"
              size="lg"
              className="max-w-72"
              disabled={
                isLoading ||
                (formData.recipientType === 'specific' &&
                  formData.userIds.length === 0)
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
