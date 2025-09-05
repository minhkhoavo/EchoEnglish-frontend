import React, { useState, useMemo } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { TestCard } from '@/features/test/components/TestCard';
import { UserSidebar } from '@/features/test/components/UserSidebar';
import { useGetTOEICTestsQuery } from '@/features/test/services/testApi';

interface TOEICTestsContentProps {
  testsPerPage?: number;
}

const TOEICTestsContent = ({ testsPerPage = 6 }: TOEICTestsContentProps) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const years = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  // API call
  const { data: tests = [], error, isLoading } = useGetTOEICTestsQuery();

  // Filter tests based on search term and year
  const filteredTests = useMemo(() => {
    let filtered = tests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.testId.includes(searchTerm)
      );
    }

    // Filter by year
    if (selectedYear !== 'All') {
      filtered = filtered.filter((test) =>
        test.testTitle.includes(selectedYear)
      );
    }

    return filtered;
  }, [tests, searchTerm, selectedYear]);

  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const endIndex = startIndex + testsPerPage;
  const currentTests = filteredTests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear]);

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
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            TOEIC Test Library
          </h1>
          <p className="text-muted-foreground">
            Official and practice TOEIC test collection
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          {/* Year Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className="transition-all"
              >
                {year}
              </Button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tests by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-muted-foreground">
            Found <span className="font-semibold">{filteredTests.length}</span>{' '}
            tests
            {searchTerm && (
              <span>
                {' '}
                for keyword "<span className="font-semibold">{searchTerm}</span>
                "
              </span>
            )}
          </div>
        </div>

        {/* Test Cards Grid */}
        {currentTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTests.map((test) => (
              <TestCard key={test.testId} test={test} />
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
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        setCurrentPage(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <UserSidebar />
    </div>
  );
};

export default TOEICTestsContent;
