import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { UserFilterCard } from '../components/UserFilterCard';
import { UserTable } from '../components/UserTable';
import { UserStatsOverview } from '../components/UserStatsOverview';
import { EditUserDialog } from '../components/EditUserDialog';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '../services/userApi';
import type { User, UserFilters } from '../types/user.types';

export const AdminUserPage = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
    search: '',
    gender: undefined,
    isActive: undefined,
    includeDeleted: 'true',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, isFetching } = useGetUsersQuery(filters);
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (userId: string, data: Partial<User>) => {
    try {
      await updateUser({ id: userId, data }).unwrap();
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser({ id: user._id }).unwrap();
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleRestore = async (user: User) => {
    try {
      await restoreUser(user._id).unwrap();
      toast({
        title: 'Success',
        description: 'User restored successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to restore user',
        variant: 'destructive',
      });
    }
  };

  const stats = data?.data?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    deletedUsers: 0,
    totalCredits: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Overview */}
      <UserStatsOverview stats={stats} />

      {/* Filters */}
      <UserFilterCard filters={filters} onFilter={handleFilterChange} />

      {/* Spacing */}
      <div className="h-2" />

      {/* User Table */}
      <UserTable
        data={data?.data?.users || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveUser}
      />

      {/* Pagination */}
      {data?.data?.pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing{' '}
            {(data.data.pagination.page - 1) * data.data.pagination.limit + 1}{' '}
            to{' '}
            {Math.min(
              data.data.pagination.page * data.data.pagination.limit,
              data.data.pagination.total
            )}{' '}
            of {data.data.pagination.total} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! - 1)}
              disabled={!data.data.pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(filters.page! + 1)}
              disabled={!data.data.pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
