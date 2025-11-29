import { Button } from '@/components/ui/button';
import { useResourceManagement } from '@/features/resource/hooks/useResourceManagement';
import UnifiedResourceList from '@/features/resource/components/UnifiedResourceList';

const ITEMS_PER_PAGE = 6;

const ResourcePage = () => {
  const {
    resources,
    totalPages,
    totalCounts,
    isLoading,
    error,
    handleResourceSelect,
  } = useResourceManagement({
    isAdmin: false,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Document Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of English learning resources including
            articles and videos to improve your language skills
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">Failed to load resources</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try again
            </Button>
          </div>
        )}

        {/* Resource List */}
        <UnifiedResourceList
          resources={resources}
          onResourceSelect={handleResourceSelect}
          isLoading={isLoading}
          totalPages={totalPages}
          totalCounts={totalCounts}
        />
      </div>
    </div>
  );
};

export default ResourcePage;
