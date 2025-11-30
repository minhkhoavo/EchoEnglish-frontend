import { useState, useMemo } from 'react';
import CustomPagination from '@/components/CustomPagination';
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
import { useToast } from '@/hooks/use-toast';

export const AdminUserPage = () => {
  const { toast } = useToast();
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
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
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
      await deleteUser({ id: user._id, hard: false }).unwrap();
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
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
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
