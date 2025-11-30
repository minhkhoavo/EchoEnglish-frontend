import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showEllipsis?: boolean;
  maxVisiblePages?: number;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showEllipsis = true,
  maxVisiblePages = 5,
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (!showEllipsis || totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = showEllipsis && visiblePages[0] > 2;
  const showEndEllipsis =
    showEllipsis && visiblePages[visiblePages.length - 1] < totalPages - 1;

  return (
    <Pagination className={cn('mx-auto flex w-full justify-center', className)}>
      <PaginationContent className="gap-1">
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, currentPage - 1));
            }}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 select-none outline-none focus:outline-none',
              currentPage === 1 && 'pointer-events-none opacity-50'
            )}
            aria-label="Go to previous page"
          />
        </PaginationItem>

        {/* First Page + Ellipsis */}
        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(1);
                }}
                className="cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 select-none outline-none focus:outline-none"
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            </PaginationItem>
          </>
        )}

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
              isActive={currentPage === page}
              className={cn(
                'cursor-pointer transition-all duration-200 select-none outline-none focus:outline-none',
                currentPage === page
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Last Page + Ellipsis */}
        {showEndEllipsis && (
          <>
            <PaginationItem>
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(totalPages);
                }}
                className="cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 select-none outline-none focus:outline-none"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.min(totalPages, currentPage + 1));
            }}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 select-none outline-none focus:outline-none',
              currentPage === totalPages && 'pointer-events-none opacity-50'
            )}
            aria-label="Go to next page"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CustomPagination;
