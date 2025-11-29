import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  Youtube,
  Rss,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useResourceManagement } from '@/features/resource/hooks/useResourceManagement';
import UnifiedResourceList from '@/features/resource/components/UnifiedResourceList';
import {
  useSearchResourcesQuery,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useTriggerRssCrawlMutation,
  useSaveTranscriptMutation,
} from '@/features/resource/services/resourceApi';
import {
  ResourceType,
  type Resource,
} from '@/features/resource/types/resource.type';
import {
  setSearchQuery,
  setActiveTab,
  setCurrentPage,
  setSuitableFilter,
  setShowAddVideo,
  setVideoUrl,
} from '@/features/resource/slices/resourceSlice';
import type { RootState } from '@/core/store/store';

const ITEMS_PER_PAGE = 5;

const AdminResourcePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Resource management hook
  const {
    resources,
    totalPages,
    isLoading,
    error,
    handleResourceSelect,
    refetch,
  } = useResourceManagement({
    isAdmin: true,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  // Redux state for admin-specific features
  const { showAddVideo, videoUrl } = useSelector(
    (state: RootState) => state.resource
  );

  const [updateResource, { isLoading: isUpdating }] =
    useUpdateResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteResourceMutation();
  const [triggerRssCrawl, { isLoading: isCrawling }] =
    useTriggerRssCrawlMutation();
  const [saveTranscript, { isLoading: isSaving }] = useSaveTranscriptMutation();

  const handleTriggerRssCrawl = async () => {
    try {
      await triggerRssCrawl().unwrap();
      toast({
        title: 'Success',
        description: 'RSS crawl triggered successfully',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to trigger RSS crawl',
        variant: 'destructive',
      });
    }
  };

  const handleSaveVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a video URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveTranscript({ url: videoUrl }).unwrap();
      toast({
        title: 'Success',
        description: 'Video saved successfully',
      });
      dispatch(setShowAddVideo(false));
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save video',
        variant: 'destructive',
      });
    }
  };

  // Handlers for resource actions

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

      refetch();
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

      refetch();
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

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">
              Resource Management
            </h1>
            <p className="text-gray-600">
              Manage learning resources, approve content, and trigger RSS
              crawling
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resources
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => dispatch(setShowAddVideo(true))}>
                <Youtube className="h-4 w-4 mr-2" />
                Add YouTube Video
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleTriggerRssCrawl}
                disabled={isCrawling}
              >
                <Rss className="h-4 w-4 mr-2" />
                {isCrawling ? 'Crawling...' : 'Trigger RSS Crawl'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Add Video Form - Hidden by default */}
      {showAddVideo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Add YouTube Video</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(setShowAddVideo(false))}
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video URL..."
              value={videoUrl}
              onChange={(e) => dispatch(setVideoUrl(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveVideo();
                }
                if (e.key === 'Escape') {
                  dispatch(setShowAddVideo(false));
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={handleSaveVideo}
              disabled={isSaving}
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSaving ? 'Adding...' : 'Add Video'}
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Failed to load resources</p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      )}

      <UnifiedResourceList
        resources={resources}
        onResourceSelect={handleResourceSelect}
        isLoading={isLoading}
        totalPages={totalPages}
        isAdmin={true}
        onApprove={handleApproveResource}
        onReject={handleRejectResource}
        onDelete={handleDeleteResource}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default AdminResourcePage;
