import React, { useState, useMemo } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomPagination from '@/components/ui/custom-pagination';
import { UnifiedTestCard } from '@/features/tests/components/UnifiedTestCard';
import { UserSidebar } from '@/features/tests/components/UserSidebar';
import { useGetTOEICTestsQuery } from '@/features/tests/services/listeningReadingTestAPI';
import { useGetSpeakingTestsQuery } from '@/features/tests/services/speakingTestApi';
import { useGetWritingTestsQuery } from '@/features/tests/services/writingTestApi';

interface AllTestsPageProps {
  testsPerPage?: number;
  onTestSelect?: (testId: string) => void;
}

const AllTestsPage = ({
  testsPerPage = 6,
  onTestSelect,
}: AllTestsPageProps) => {
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const testTypes = [
    { id: 'all', name: 'All Tests' },
    { id: 'listening-reading', name: 'Listening & Reading' },
    { id: 'speaking', name: 'Speaking' },
    { id: 'writing', name: 'Writing' },
  ];

  // API calls
  const {
    data: toeicTests = [],
    error: toeicError,
    isLoading: isToeicLoading,
  } = useGetTOEICTestsQuery();

  const {
    data: speakingTests = [],
    error: speakingError,
    isLoading: isSpeakingLoading,
  } = useGetSpeakingTestsQuery();

  const {
    data: writingTests = [],
    error: writingError,
    isLoading: isWritingLoading,
  } = useGetWritingTestsQuery();

  // Combine all tests
  const allTests = useMemo(() => {
    return [
      ...toeicTests.map((test) => ({
        ...test,
        type: 'listening-reading' as const,
        testId:
          typeof test.testId === 'string' ? Number(test.testId) : test.testId,
      })),
      ...speakingTests.map((test) => ({
        ...test,
        type: 'speaking' as const,
      })),
      ...writingTests.map((test) => ({
        ...test,
        type: 'writing' as const,
      })),
    ];
  }, [toeicTests, speakingTests, writingTests]);

  // Filter tests based on search term and type
  const filteredTests = useMemo(() => {
    let filtered = allTests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.testId.toString().includes(searchTerm)
      );
    }

    // Filter by type
    if (selectedTestType !== 'all') {
      filtered = filtered.filter((test) => test.type === selectedTestType);
    }

    return filtered;
  }, [allTests, searchTerm, selectedTestType]);

  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const endIndex = startIndex + testsPerPage;
  const currentTests = filteredTests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTestType]);

  const isLoading = isToeicLoading || isSpeakingLoading || isWritingLoading;
  const error = toeicError || speakingError || writingError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading tests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Unable to load test list. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                TOEIC Test Library
              </h1>
              <p className="text-muted-foreground">
                Complete TOEIC test collection including Reading, Listening,
                Speaking, and Writing
              </p>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
              {/* Test Type Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {testTypes.map((testType) => (
                  <Button
                    key={testType.id}
                    variant={
                      selectedTestType === testType.id ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedTestType(testType.id)}
                    className="hover-scale"
                  >
                    {testType.name}
                  </Button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tests by name or testId..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-muted-foreground">
                Found{' '}
                <span className="font-semibold">{filteredTests.length}</span>{' '}
                tests
                {searchTerm && (
                  <span>
                    {' '}
                    for keyword "
                    <span className="font-semibold">{searchTerm}</span>"
                  </span>
                )}
              </div>
            </div>

            {/* Test Cards Grid */}
            {currentTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentTests.map((test) => (
                  <UnifiedTestCard
                    key={`${test.type}-${test.testId}`}
                    test={test}
                    onTestSelect={onTestSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-2">
                  No tests found
                </div>
                <div className="text-muted-foreground text-sm">
                  Try changing the filter or search keyword
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <UserSidebar />
        </div>
      </div>
    </div>
  );
};

export default AllTestsPage;
