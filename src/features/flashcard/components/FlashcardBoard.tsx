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
  useGetCategoriesQuery,
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
  ArrowUpDown,
  BookOpen,
  Sparkles,
  LayoutGrid,
  AlertCircle,
} from 'lucide-react';
import { sortOptions } from '../types/flashcard.types';
import type { Flashcard, Category } from '../types/flashcard.types';
import { cn } from '@/lib/utils';

const FlashcardBoard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, viewMode, sortBy, sortDirection, searchQuery } = useSelector(
    (state: RootState) => state.flashcard
  );

  const { data: flashcards = [], isLoading, error } = useGetFlashcardsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteFlashcard] = useDeleteFlashcardMutation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const [showFilters, setShowFilters] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const isServerDisconnected =
    error &&
    (('message' in error && error.message === 'SERVER_DISCONNECTED') ||
      ('data' in error && error.data === 'Network Error'));

  const selectedCategoryName = React.useMemo(() => {
    if (!selectedCategory) return null;
    const cat = (categories as Category[]).find(
      (c) => c._id === selectedCategory
    );
    return cat ? cat.name : selectedCategory;
  }, [categories, selectedCategory]);
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

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
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
    if (isServerDisconnected) {
      toast({
        title: 'Server Unavailable',
        description:
          'Cannot connect to the server. Please check your connection.',
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
    value: string | boolean | string[] | null
  ) => {
    if (filterKey === 'difficulty' && value === 'all') {
      dispatch(setFilters({ [filterKey]: '' }));
    } else {
      dispatch(setFilters({ [filterKey]: value }));
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.difficulty) count++;
    if (filters.aiGenerated !== null) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const handleDeleteFlashcard = async (id: string) => {
    try {
      await deleteFlashcard(id).unwrap();
      toast({
        title: 'Success',
        description: 'Flashcard deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flashcard.',
        variant: 'destructive',
      });
    }
  };

  // Show skeleton loading during initial load
  if (isLoading && flashcards.length === 0) {
    return (
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-slate-200 p-6">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-10 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-slate-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header Skeleton */}
          <div className="bg-white border-b border-slate-200 p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-8 bg-slate-200 rounded-lg w-64 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-slate-200 rounded-lg w-24 animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 bg-slate-200 rounded-lg flex-1 max-w-md animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-24 animate-pulse"></div>
                <div className="h-10 bg-slate-200 rounded-lg w-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-200 rounded-xl animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <CategorySidebar
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  {selectedCategory ? (
                    <BookOpen className="w-5 h-5 text-slate-600" />
                  ) : (
                    <LayoutGrid className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {selectedCategoryName || 'All Flashcards'}
                  </h1>
                  <p className="text-slate-600 text-sm">
                    {filteredFlashcards.length} flashcard
                    {filteredFlashcards.length !== 1 ? 's' : ''}
                    {selectedCategoryName && ` in ${selectedCategoryName}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreateEditFlashcardDialog
                trigger={
                  <Button
                    className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
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
                    className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
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
              <Button
                variant="outline"
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search flashcards..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={`${sortBy}-${sortDirection}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-48 border-slate-300 bg-white">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-slate-500" />
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
                className={cn(
                  'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                  showFilters && 'bg-slate-100 border-slate-400'
                )}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge className="ml-2 bg-slate-900 text-white text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>

              <div className="border-l border-slate-300 pl-2 ml-2">
                <div className="flex rounded-lg border border-slate-300 bg-white overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch(setViewMode('grid'))}
                    className={cn(
                      'rounded-none border-0',
                      viewMode === 'grid'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch(setViewMode('list'))}
                    className={cn(
                      'rounded-none border-0 border-l border-slate-300',
                      viewMode === 'list'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    Difficulty
                  </label>
                  <Select
                    value={filters.difficulty || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('difficulty', value)
                    }
                  >
                    <SelectTrigger className="w-32 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    AI Generated
                  </label>
                  <Select
                    value={
                      filters.aiGenerated === null
                        ? 'all'
                        : filters.aiGenerated.toString()
                    }
                    onValueChange={(value) =>
                      handleFilterChange(
                        'aiGenerated',
                        value === 'all' ? null : value === 'true'
                      )
                    }
                  >
                    <SelectTrigger className="w-32 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">AI Generated</SelectItem>
                      <SelectItem value="false">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1"></div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    dispatch(clearFilters());
                    setShowFilters(false);
                  }}
                  className="text-slate-600 border-slate-300 hover:bg-slate-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          {isServerDisconnected ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Server Unavailable
              </h3>
              <p className="text-slate-600 mb-4">
                Cannot connect to the server. Please check your connection or
                try again later.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Retry Connection
              </Button>
            </div>
          ) : paginatedFlashcards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {searchQuery || selectedCategory
                  ? 'No flashcards found'
                  : 'No flashcards yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filters'
                  : 'Create your first flashcard to get started'}
              </p>
              {!searchQuery && !selectedCategory && (
                <CreateEditFlashcardDialog
                  trigger={
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Flashcard
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Flashcard Grid/List */}
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                )}
              >
                {paginatedFlashcards.map((flashcard) => (
                  <FlashcardItem
                    key={flashcard._id || flashcard.id}
                    flashcard={flashcard}
                    onEdit={setEditingFlashcard}
                    onDelete={handleDeleteFlashcard}
                    viewMode={viewMode}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Flashcard Dialog */}
      {editingFlashcard && (
        <CreateEditFlashcardDialog
          flashcard={editingFlashcard}
          isEdit={true}
          onSuccess={() => setEditingFlashcard(null)}
        />
      )}
    </div>
  );
};

export default FlashcardBoard;
