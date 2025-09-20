import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, BarChart3, FileText, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomPagination from '@/components/ui/custom-pagination';
import { UserSidebar } from '@/features/tests/components/UserSidebar';
import { UnifiedTestCard } from '@/features/tests/components/UnifiedTestCard';
import { useGetTOEICTestsQuery } from '@/features/tests/services/listeningReadingTestAPI';
import { useGetSpeakingTestsQuery } from '@/features/tests/services/speakingTestApi';
import { useGetWritingTestsQuery } from '@/features/tests/services/writingTestApi';

interface AllTestsPageProps {
  testsPerPage?: number;
  onTestSelect?: (testId: string) => void;
}

const testTypes = [
  {
    id: 'all',
    name: 'All Tests',
  },
  {
    id: 'listening-reading',
    name: 'Listening - Reading',
  },
  {
    id: 'speaking',
    name: 'Speaking',
  },
  {
    id: 'writing',
    name: 'Writing',
  },
];

const AllTestsPage = ({
  testsPerPage = 6,
  onTestSelect,
}: AllTestsPageProps) => {
  const [selectedTestType, setSelectedTestType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Loading state
  if (isToeicLoading || isSpeakingLoading || isWritingLoading) {
    return (
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <UserSidebar />
        </div>
      </div>
    );
  }

  // Error handling
  if (toeicError || speakingError || writingError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">
            Error loading tests. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Test Library
                </h1>
                <p className="text-muted-foreground mt-2">
                  Choose from our collection of TOEIC practice tests
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                {/* Test Type Filters */}
                <div className="flex flex-wrap gap-2">
                  {testTypes.map((testType) => (
                    <div
                      key={testType.id}
                      className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition hover:scale-105 ${
                        selectedTestType === testType.id
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'bg-background border border-border text-foreground'
                      }`}
                      onClick={() => setSelectedTestType(testType.id)}
                    >
                      {testType.name}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                  <BarChart3 className="h-4 w-4" />
                  <span>{filteredTests.length} tests available</span>
                </div>
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
            </div>
          </div>

          {/* Test Grid */}
          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 mb-4 text-muted-foreground">
                <Search className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium mb-2">No tests found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentTests.map((test) => (
                  <UnifiedTestCard
                    key={`${test.type}-${test.testId}`}
                    test={test}
                    onTestSelect={onTestSelect}
                  />
                ))}
              </div>

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
            </>
          )}
        </div>
        <UserSidebar />
      </div>
    </div>
  );
};

export default AllTestsPage;
