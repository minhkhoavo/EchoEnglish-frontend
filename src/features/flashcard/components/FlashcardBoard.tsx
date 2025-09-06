import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/core/store/store';
import {
  setSearchQuery,
  setFilters,
  setViewMode,
  setSorting,
  clearFilters,
} from '../slices/flashcardSlice';
import {
  useGetFlashcardsQuery,
  useDeleteFlashcardMutation,
} from '../services/flashcardApi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CustomPagination from '@/components/ui/custom-pagination';
import FlashcardItem from './FlashcardItem';
import CategorySidebar from './CategorySidebar.tsx';
import CreateEditFlashcardDialog from './CreateEditFlashcardDialog';
import CreateEditCategoryDialog from './CreateEditCategoryDialog';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  SlidersHorizontal,
  Brain,
  X,
  Download,
  Upload,
  FolderPlus,
} from 'lucide-react';
import { sortOptions } from '../types/flashcard.types';
import type { Flashcard } from '../types/flashcard.types';

const FlashcardBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, viewMode, sortBy, sortDirection, searchQuery } = useSelector(
    (state: RootState) => state.flashcard
  );

  const { data: flashcards = [], isLoading, error } = useGetFlashcardsQuery();
  const [deleteFlashcard] = useDeleteFlashcardMutation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const [showFilters, setShowFilters] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const isServerDisconnected =
    error &&
    (('message' in error && error.message === 'SERVER_DISCONNECTED') ||
      ('status' in error && error.status === 0));

  // Filter and sort flashcards locally
  const filteredFlashcards = React.useMemo(() => {
    let filtered = [...flashcards];
    if (searchQuery) {
      filtered = filtered.filter(
        (card) =>
          card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((card) => card.category === selectedCategory);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(
        (card) => card.difficulty === filters.difficulty
      );
    }

    if (filters.aiGenerated) {
      filtered = filtered.filter(
        (card) => card.isAIGenerated === filters.aiGenerated
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((card) =>
        filters.tags.some((tag) => card.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Flashcard];
      const bValue = b[sortBy as keyof Flashcard];
      if (
        sortBy === 'createdAt' ||
        sortBy === 'updatedAt' ||
        sortBy === 'lastReviewed'
      ) {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [
    flashcards,
    searchQuery,
    selectedCategory,
    filters,
    sortBy,
    sortDirection,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFlashcards.length / pageSize);
  const paginatedFlashcards = filteredFlashcards.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredFlashcards.length, pageSize, currentPage, totalPages]);

  useEffect(() => {
    // Show different toast based on error type
    if (isServerDisconnected) {
      toast({
        title: 'Server Unavailable',
        description:
          'Cannot connect to the server. Please check your connection or try again later.',
        variant: 'destructive',
      });
    } else if (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while loading data.',
        variant: 'destructive',
      });
    }
  }, [error, isServerDisconnected, toast]);

  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, direction] = value.split('-');
    const option = sortOptions.find(
      (opt) => opt.value === sortBy && opt.direction === direction
    );
    if (option) {
      dispatch(
        setSorting({ sortBy: option.value, direction: option.direction })
      );
    }
  };

  const handleFilterChange = (
    filterKey: string,
    value: string | boolean | string[]
  ) => {
    if (filterKey === 'difficulty' && value === 'all') {
      dispatch(setFilters({ [filterKey]: '' }));
    } else {
      dispatch(setFilters({ [filterKey]: value }));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowFilters(false);
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await deleteFlashcard(id).unwrap();
        toast({
          title: 'Success',
          description: 'Flashcard deleted successfully.',
        });
      } catch (error) {
        console.error('Failed to delete flashcard:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete flashcard. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditFlashcard = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.difficulty) count++;
    if (filters.aiGenerated) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  // Show skeleton loading during initial load
  if (isLoading && flashcards.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded mb-6"></div>
            <div className="scrollbar-hide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <CategorySidebar
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategory || 'All Flashcards'}
                </h1>
              </div>
              <p className="text-gray-600">
                {filteredFlashcards.length} flashcard
                {filteredFlashcards.length !== 1 ? 's' : ''}
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CreateEditFlashcardDialog
                trigger={
                  <Button
                    className="gap-2"
                    disabled={isServerDisconnected}
                    title={
                      isServerDisconnected ? 'Server unavailable' : undefined
                    }
                  >
                    <Plus size={16} />
                    Create Flashcard
                  </Button>
                }
              />
              <CreateEditCategoryDialog
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={isServerDisconnected}
                    title={
                      isServerDisconnected ? 'Server unavailable' : undefined
                    }
                  >
                    <FolderPlus size={16} />
                    New Category
                  </Button>
                }
              />
              <Button variant="outline" className="border-gray-300">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={`${sortBy}-${sortDirection}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-48 border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem
                      key={`${option.value}-${option.direction}`}
                      value={`${option.value}-${option.direction}`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`border-gray-300 ${showFilters ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="ml-2 bg-blue-600 text-white text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              <div className="border-l border-gray-300 pl-2 ml-2">
                <div className="flex rounded-md border border-gray-300 bg-white">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch(setViewMode('grid'))}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch(setViewMode('list'))}
                    className="rounded-l-none border-l"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <Select
                    value={filters.difficulty || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('difficulty', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All difficulties</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Special Filters */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Special
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.aiGenerated}
                        onChange={(e) =>
                          handleFilterChange('aiGenerated', e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Brain
                        className={`h-4 w-4 ml-2 mr-1 ${filters.aiGenerated ? 'text-purple-600' : 'text-gray-400'}`}
                      />
                      <span className="text-sm text-gray-700">
                        AI Generated
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {isServerDisconnected ? (
            // Server Disconnected State
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">!</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Server Unavailable
              </h3>
              <p className="text-gray-600 mb-6">
                Cannot connect to the server. Please check your internet
                connection and try again.
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Retry Connection
                </Button>
                <Button variant="outline">Check Status</Button>
              </div>
            </div>
          ) : paginatedFlashcards.length === 0 ? (
            // Empty State (only when no server error)
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No flashcards found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || getActiveFiltersCount() > 0
                  ? 'Try adjusting your search or filters'
                  : 'Create your first flashcard to get started'}
              </p>
              <CreateEditFlashcardDialog
                trigger={
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Flashcard
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'scrollbar-hide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {paginatedFlashcards.map((flashcard: Flashcard) => (
                  <FlashcardItem
                    key={flashcard._id || flashcard.id}
                    flashcard={flashcard}
                    viewMode={viewMode}
                    onEdit={handleEditFlashcard}
                    onDelete={handleDeleteFlashcard}
                  />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-6"
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Flashcard Dialog */}
      {editingFlashcard && (
        <CreateEditFlashcardDialog
          flashcard={editingFlashcard}
          isEdit={true}
          onSuccess={() => {
            setEditingFlashcard(null);
          }}
          trigger={<div style={{ display: 'none' }} />}
        />
      )}
    </div>
  );
};

export default FlashcardBoard;
