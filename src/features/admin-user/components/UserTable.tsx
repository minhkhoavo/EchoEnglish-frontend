import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Edit, Trash2, RefreshCw, Mail, Phone, Coins } from 'lucide-react';
import type { User } from '../types/user.types';
import { UserAvatar } from '@/components/UserAvatar';

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
}

export const UserTable = ({
  data,
  onEdit,
  onDelete,
  onRestore,
}: UserTableProps) => {
  if (data.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
        <div className="flex justify-center mb-4">
          <Mail className="h-16 w-16 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50/50 border-b-2 border-gray-200">
            <tr>
              <th className="w-[28%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gender
              </th>
              <th className="w-[14%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="w-[14%] px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y-2 divide-gray-100">
            {data.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-blue-50/30 transition-colors border-b border-gray-100"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={user.image}
                      alt={user.fullName}
                      fallbackText={user.fullName}
                      size="md"
                      ringClassName="ring-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.phoneNumber ? (
                    <div className="text-sm text-gray-900 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{user.phoneNumber}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {user.gender ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {user.gender.toLowerCase()}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                      <Badge
                        key={typeof role === 'object' ? role._id : role}
                        variant="secondary"
                        className="text-xs"
                      >
                        {typeof role === 'object' ? role.name : role}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                    <Coins className="h-4 w-4" />
                    {user.credits?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={user.isDeleted ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {user.isDeleted ? 'Deleted' : 'Active'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {user.isDeleted ? (
                      <ConfirmationDialog
                        title="Restore User"
                        description={`Are you sure you want to restore "${user.fullName}"? The user will become active again.`}
                        onConfirm={() => onRestore(user)}
                        confirmText="Restore"
                        variant="default"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      </ConfirmationDialog>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmationDialog
                          title="Delete User"
                          description={`Are you sure you want to delete "${user.fullName}"? This action can be undone by restoring the user.`}
                          onConfirm={() => onDelete(user)}
                          variant="destructive"
                        >
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmationDialog>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
