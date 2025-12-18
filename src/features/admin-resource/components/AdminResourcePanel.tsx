import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AdminResourceList } from './AdminResourceList';
import { ArticleEditor } from './ArticleEditor';
import {
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useReindexKnowledgeMutation,
} from '../services/adminResourceApi';
import { useSearchResourcesQuery } from '@/features/resource/services/resourceApi';
import type { Resource } from '../types/resource.types';
import { Plus, Database, Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import CustomPagination from '@/components/CustomPagination';
import { ResourceFilterCard } from './ResourceFilterCard';
import type { ResourceFilters } from '../types/resource.types';

type ViewMode = 'list' | 'create' | 'edit';

interface AdminResourcePanelProps {
  skipQuery?: boolean;
}

export const AdminResourcePanel = ({
  skipQuery = false,
}: AdminResourcePanelProps = {}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingResource, setEditingResource] = useState<
    Resource | undefined
  >();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResourceFilters>({
    limit: 5,
    sort: 'newest',
  });

  const [updateResource, { isLoading: isUpdating }] =
    useUpdateResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [reindexKnowledge, { isLoading: isReindexing }] =
    useReindexKnowledgeMutation();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useSearchResourcesQuery(
    {
      page,
      limit: filters.limit || 5,
      type: filters.type
        ? filters.type === 'article'
          ? 'web_rss'
          : 'youtube'
        : undefined,
      q: filters.q,
      suitableForLearners: filters.suitableForLearners
        ? filters.suitableForLearners === 'true'
        : undefined,
      sortBy: filters.sort,
      isAdmin: true,
    },
    {
      skip: skipQuery,
    }
  );

  const resources = useMemo(() => response?.data?.resources || [], [response]);
  const totalPages = response?.data?.pagination?.totalPages || 1;

  const handleFilterChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleApproveResource = async (resource: Resource) => {
    try {
      const result = await updateResource({
        id: resource._id,
        data: { suitableForLearners: true },
      }).unwrap();

      toast.success(result.message || 'Resource approved successfully');

      refetch();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to approve resource'
      );
    }
  };

  const handleRejectResource = async (resource: Resource) => {
    try {
      const result = await updateResource({
        id: resource._id,
        data: { suitableForLearners: false },
      }).unwrap();

      toast.success(result.message || 'Resource rejected successfully');

      refetch();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to reject resource'
      );
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    try {
      const result = await deleteResource(resource._id).unwrap();

      toast.success(result.message || 'Resource deleted successfully');

      refetch();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to delete resource'
      );
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setViewMode('edit');
  };

  const handleReindexKnowledge = async () => {
    try {
      const result = await reindexKnowledge().unwrap();
      toast.success(
        `Đã reindex ${result.data.success}/${result.data.total} bài viết. Thất bại: ${result.data.failed}`
      );
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ||
          'Failed to reindex knowledge base'
      );
    }
  };

  const handleEditorBack = () => {
    setViewMode('list');
    setEditingResource(undefined);
  };

  const handleEditorSuccess = () => {
    setViewMode('list');
    setEditingResource(undefined);
    refetch();
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

  if (isLoading) {
    return <LoadingSpinner message="Loading resources..." />;
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

      {/* Filters */}
      <ResourceFilterCard filters={filters} onFilter={setFilters} />

      {/* Resource List */}
      <AdminResourceList
        resources={resources as Resource[]}
        onApprove={handleApproveResource}
        onReject={handleRejectResource}
        onDelete={handleDeleteResource}
        onEdit={handleEditResource}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <CustomPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
