import { useToast } from '@/hooks/use-toast';
import { AdminResourceList } from './AdminResourceList';
import {
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} from '../services/adminResourceApi';
import type { Resource } from '../types/resource.types';

interface AdminResourcePanelProps {
  resources: Resource[];
  isLoading: boolean;
  onRefetch: () => void;
}

export const AdminResourcePanel = ({
  resources,
  isLoading,
  onRefetch,
}: AdminResourcePanelProps) => {
  const { toast } = useToast();
  const [updateResource, { isLoading: isUpdating }] =
    useUpdateResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();

  const handleApproveResource = async (resource: Resource) => {
    try {
      await updateResource({
        id: resource._id,
        data: { suitableForLearners: true },
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Resource approved successfully',
      });

      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve resource',
        variant: 'destructive',
      });
    }
  };

  const handleRejectResource = async (resource: Resource) => {
    try {
      await updateResource({
        id: resource._id,
        data: { suitableForLearners: false },
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Resource rejected successfully',
      });

      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject resource',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    try {
      await deleteResource(resource._id).unwrap();

      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      });

      onRefetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Resource List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-gray-500">Loading resources...</p>
        </div>
      ) : (
        <AdminResourceList
          resources={resources}
          onApprove={handleApproveResource}
          onReject={handleRejectResource}
          onDelete={handleDeleteResource}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
