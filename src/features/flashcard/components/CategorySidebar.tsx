import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/core/store/store';
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from '../services/flashcardApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CreateEditCategoryDialog from './CreateEditCategoryDialog';
import type { Category } from '../types/flashcard.types';
import {
  Plus,
  Folder,
  BookOpen,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  // Check if error is server disconnection
  const isServerDisconnected =
    error &&
    typeof error === 'object' &&
    (('message' in error && error.message === 'SERVER_DISCONNECTED') ||
      ('status' in error && error.status === 0));
  // Show error toast if API fails, but don't block UI
  useEffect(() => {
    if (isServerDisconnected) {
      toast({
        title: 'Server Unavailable',
        description: 'Cannot load categories from server.',
        variant: 'destructive',
      });
    } else if (error) {
      toast({
        title: 'Categories Error',
        description: 'Unable to load categories.',
        variant: 'destructive',
      });
    }
  }, [error, isServerDisconnected, toast]);

  const handleCategorySelect = (categoryName: string | null) => {
    onCategorySelect(categoryName);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      const dialogOverlay = document.querySelector(
        '[data-radix-dialog-overlay], .fixed.inset-0.z-50'
      );
      const dialogContent = document.querySelector(
        '[role="dialog"], dialog, [data-radix-dialog-content]'
      );

      if (
        (dialogOverlay && dialogOverlay.contains(target)) ||
        (dialogContent && dialogContent.contains(target))
      ) {
        return;
      }

      // ignore clicks inside the category options menu itself
      const optionsMenu = document.querySelector('.category-options-menu');
      if (optionsMenu && optionsMenu.contains(target)) {
        return;
      }

      setShowCategoryOptions(null);
    };

    if (showCategoryOptions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCategoryOptions]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId).unwrap();
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      if (selectedCategory === categoryId) {
        onCategorySelect(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const getCategoryIcon = (category: Category) => {
    if (category.icon) {
      return <span className="text-lg">{category.icon}</span>;
    }
    return <Folder className="h-5 w-5" />;
  };

  const getCategoryColor = (color: string) => {
    // Convert bg-color-500 format to appropriate classes
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': 'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-500': 'bg-green-100 text-green-800 border-green-200',
      'bg-purple-500': 'bg-purple-100 text-purple-800 border-purple-200',
      'bg-orange-500': 'bg-orange-100 text-orange-800 border-orange-200',
      'bg-red-500': 'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-500': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-pink-500': 'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-500': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const totalFlashcards = categories.reduce(
    (sum: number, cat: Category) => sum + (cat.flashcardCount || 0),
    0
  );

  // Show skeleton only during initial load
  const showSkeleton = isLoading && categories.length === 0;

  return (
    <>
      <div
        className={`${isCollapsed ? 'w-16' : 'w-80'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          {!isCollapsed && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <CreateEditCategoryDialog
                trigger={
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                  </Button>
                }
              />
            </>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* All Flashcards */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-colors duration-200 ${
              selectedCategory === null
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center ${isCollapsed ? '' : 'mr-3'}`}
              >
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              {!isCollapsed && (
                <div>
                  <span className="font-medium">All Flashcards</span>
                  <p className="text-xs text-gray-500">View all cards</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                {totalFlashcards}
              </Badge>
            )}
          </button>
        </div>

        {/* Categories List */}
        <div className="scrollbar-hide flex-1 p-2 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Your Categories
              </h3>
            </div>
          )}

          <div className="space-y-2 scrollbar-hide">
            {showSkeleton
              ? // Skeleton loading
                !isCollapsed && (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 rounded-lg"
                      ></div>
                    ))}
                  </div>
                )
              : isServerDisconnected
                ? // Server disconnected state
                  !isCollapsed && (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-red-500 text-lg">⚠️</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Categories unavailable
                      </p>
                      <p className="text-xs text-gray-500">
                        Server connection failed
                      </p>
                    </div>
                  )
                : // Actual categories
                  categories.map((category: Category) => (
                    <div key={category._id} className="relative group">
                      <button
                        onClick={() =>
                          category._id && handleCategorySelect(category._id)
                        }
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2.5 rounded-lg text-left transition-colors duration-200 ${
                          selectedCategory === category._id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCollapsed ? '' : 'mr-3'}`}
                            style={{
                              backgroundColor: category.color || '#3B82F6',
                            }}
                          >
                            {category.icon ? (
                              <span className="text-white text-sm">
                                {category.icon}
                              </span>
                            ) : (
                              <BookOpen className="h-4 w-4 text-white" />
                            )}
                          </div>
                          {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {category.name}
                              </div>
                              {category.description && (
                                <p className="text-xs text-gray-500 truncate">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {!isCollapsed && (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200 ml-2">
                            {category.flashcardCount || 0}
                          </Badge>
                        )}
                      </button>

                      {/* Category Options Menu */}
                      {!isCollapsed && (
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowCategoryOptions(
                                  showCategoryOptions === category._id
                                    ? null
                                    : category._id || null
                                );
                              }}
                              className="p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-500" />
                            </button>

                            {showCategoryOptions === category._id && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 category-options-menu">
                                <CreateEditCategoryDialog
                                  category={category}
                                  isEdit={true}
                                  onSuccess={() => setShowCategoryOptions(null)}
                                  trigger={
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                                      <Edit2 className="h-3 w-3" />
                                      Edit
                                    </button>
                                  }
                                />
                                <ConfirmationDialog
                                  title="Delete Category"
                                  description="Are you sure you want to delete this category? All flashcards in this category will also be affected."
                                  variant="destructive"
                                  onConfirm={() => {
                                    if (category._id) {
                                      handleDeleteCategory(category._id);
                                    }
                                    setShowCategoryOptions(null);
                                  }}
                                >
                                  <div className="w-full">
                                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2">
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </button>
                                  </div>
                                </ConfirmationDialog>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
          </div>

          {!showSkeleton &&
            !isServerDisconnected &&
            categories.length === 0 &&
            !isCollapsed && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-4">No categories yet</p>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            )}
        </div>

        {/* Footer Stats */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {totalFlashcards}
                </p>
                <p className="text-xs text-gray-500">Total Cards</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {categories.length}
                </p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-gray-600 hover:text-gray-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Statistics
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CategorySidebar;
