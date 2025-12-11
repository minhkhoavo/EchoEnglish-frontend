import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import CustomPagination from '@/components/CustomPagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  UserFilterCard,
  UserTable,
  UserStatsOverview,
  EditUserDialog,
} from '@/features/admin-user';
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  calculateUserStats,
} from '@/features/admin-user';
import type { User, UserFilters } from '@/features/admin-user';

export const AdminUserPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({
    limit: 10,
    sortBy: 'date_desc',
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: response, isLoading } = useGetUsersQuery({
    page,
    limit: filters.limit || 10,
    ...filters,
  });

  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();

  const data = useMemo(() => response?.data.users || [], [response]);
  const pagination = response?.data.pagination;
  const stats = useMemo(
    () => response?.data.stats || calculateUserStats(data),
    [response?.data.stats, data]
  );

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (userId: string, data: Partial<User>) => {
    try {
      await updateUser({ id: userId, data }).unwrap();
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
      throw error;
    }
  };

  const handleDelete = async (user: User) => {
    try {
      const result = await deleteUser({ id: user._id }).unwrap();
      toast.success(result.message || 'User deleted successfully');
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to delete user'
      );
    }
  };

  const handleRestore = async (user: User) => {
    try {
      const result = await restoreUser(user._id).unwrap();
      toast.success(result.message || 'User restored successfully');
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to restore user'
      );
    }
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage system users and their roles
              </p>
            </div>
          </div>
        </div>

        <UserStatsOverview stats={stats} />

        <UserFilterCard filters={filters} onFilter={handleFilterChange} />

        {isLoading ? (
          <LoadingSpinner message="Loading users..." />
        ) : (
          <UserTable
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <CustomPagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        <EditUserDialog
          user={editingUser}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveUser}
        />
      </div>
    </div>
  );
};
