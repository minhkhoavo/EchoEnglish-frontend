import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AdminResourceList } from './AdminResourceList';
import { ArticleEditor } from './ArticleEditor';
import {
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useReindexKnowledgeMutation,
} from '../services/adminResourceApi';
import type { Resource } from '../types/resource.types';
import { Plus, Database, Loader2 } from 'lucide-react';

interface AdminResourcePanelProps {
  resources: Resource[];
  isLoading: boolean;
  onRefetch: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';

export const AdminResourcePanel = ({
  resources,
  isLoading,
  onRefetch,
}: AdminResourcePanelProps) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingResource, setEditingResource] = useState<
    Resource | undefined
  >();

  const [updateResource, { isLoading: isUpdating }] =
    useUpdateResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [reindexKnowledge, { isLoading: isReindexing }] =
    useReindexKnowledgeMutation();

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
    } catch {
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
    } catch {
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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setViewMode('edit');
  };

  const handleReindexKnowledge = async () => {
    try {
      const result = await reindexKnowledge().unwrap();
      toast({
        title: 'Reindex Complete',
        description: `Indexed ${result.data.success}/${result.data.total} articles. Failed: ${result.data.failed}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to reindex knowledge base',
        variant: 'destructive',
      });
    }
  };

  const handleEditorBack = () => {
    setViewMode('list');
    setEditingResource(undefined);
  };

  const handleEditorSuccess = () => {
    setViewMode('list');
    setEditingResource(undefined);
    onRefetch();
  };

  // Show editor view
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <ArticleEditor
        article={editingResource}
        onBack={handleEditorBack}
        onSuccess={handleEditorSuccess}
      />
    );
  }

  // Show list view
  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => setViewMode('create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={handleReindexKnowledge}
          disabled={isReindexing}
        >
          {isReindexing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          Reindex Knowledge
        </Button>
      </div>

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
          onEdit={handleEditResource}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
