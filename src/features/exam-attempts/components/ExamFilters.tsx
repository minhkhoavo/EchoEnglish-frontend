import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X } from 'lucide-react';
import type { ExamStatus } from '../types';

interface ExamFiltersProps {
  currentFilters: {
    status: ExamStatus | 'all';
    sortBy: 'date' | 'score' | 'title';
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (
    filters: Partial<ExamFiltersProps['currentFilters']>
  ) => void;
  counts: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
}

export const ExamFilters: React.FC<ExamFiltersProps> = ({
  currentFilters,
  onFiltersChange,
  counts,
}) => {
  const handleStatusChange = (value: string) => {
    onFiltersChange({ status: value as ExamStatus | 'all' });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ sortBy: value as 'date' | 'score' | 'title' });
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      sortOrder: currentFilters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    currentFilters.status !== 'all' ||
    currentFilters.sortBy !== 'date' ||
    currentFilters.sortOrder !== 'desc';

  const getSortIcon = () => {
    if (currentFilters.sortOrder === 'asc') {
      return <ArrowUp className="h-3 w-3" />;
    }
    return <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      {/* Compact Filter controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1">
            <Filter className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-700">Filter:</span>
          </div>

          <Select
            value={currentFilters.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({counts.total})</SelectItem>
              <SelectItem value="completed">
                Done ({counts.completed})
              </SelectItem>
              <SelectItem value="in-progress">
                Active ({counts.inProgress})
              </SelectItem>
              <SelectItem value="not-started">
                New ({counts.notStarted})
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Sort:</span>
            <Select
              value={currentFilters.sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="px-2 h-8"
            >
              {getSortIcon()}
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="self-start sm:self-center h-8 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Compact Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Active:</span>

          {currentFilters.status !== 'all' && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {currentFilters.status}
              <button
                onClick={() => onFiltersChange({ status: 'all' })}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {(currentFilters.sortBy !== 'date' ||
            currentFilters.sortOrder !== 'desc') && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {currentFilters.sortBy} ({currentFilters.sortOrder})
              <button
                onClick={() =>
                  onFiltersChange({ sortBy: 'date', sortOrder: 'desc' })
                }
                className="ml-1 hover:text-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
