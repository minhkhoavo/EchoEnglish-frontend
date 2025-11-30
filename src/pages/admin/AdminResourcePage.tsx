import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Youtube, Rss, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import CustomPagination from '@/components/CustomPagination';
import { useSearchResourcesQuery } from '@/features/resource/services/resourceApi';
import {
  AdminResourcePanel,
  ResourceFilterCard,
} from '@/features/admin-resource';
import {
  useTriggerRssCrawlMutation,
  useSaveTranscriptMutation,
} from '@/features/admin-resource/services/adminResourceApi';
import type {
  Resource as AdminResource,
  ResourceFilters,
} from '@/features/admin-resource';

const AdminResourcePage = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ResourceFilters>({
    limit: 5,
    sort: 'newest',
  });
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const [triggerRssCrawl, { isLoading: isCrawling }] =
    useTriggerRssCrawlMutation();
  const [saveTranscript, { isLoading: isSaving }] = useSaveTranscriptMutation();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useSearchResourcesQuery({
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
  });

  const resources = useMemo(() => response?.data?.resources || [], [response]);
  const totalPages = response?.data?.pagination?.totalPages || 1;

  const handleFilterChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

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
      setShowAddVideo(false);
      setVideoUrl('');
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save video',
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resources
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowAddVideo(true)}>
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

      {showAddVideo && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">Add YouTube Video</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddVideo(false)}
              className="text-blue-600 hover:text-blue-800"
            >
              Cancel
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter YouTube video URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveVideo();
                }
                if (e.key === 'Escape') {
                  setShowAddVideo(false);
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
          <button onClick={() => refetch()}>Retry</button>
        </div>
      )}

      <ResourceFilterCard filters={filters} onFilter={handleFilterChange} />

      <div className="mt-6">
        <AdminResourcePanel
          resources={resources as unknown as AdminResource[]}
          isLoading={isLoading}
          onRefetch={refetch}
        />
      </div>

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

export default AdminResourcePage;
