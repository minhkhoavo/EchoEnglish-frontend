import React, { useState, useEffect } from 'react';
import type { Flashcard } from '../types/flashcard.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Brain,
  Eye,
  EyeOff,
  RotateCcw,
  Edit,
  Trash2,
} from 'lucide-react';
import { useGetCategoriesQuery } from '../services/flashcardApi';
import { useToast } from '@/hooks/use-toast';

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

const getDifficultyVariant = (difficulty: Flashcard['difficulty']) => {
  switch (difficulty) {
    case 'Easy':
      return 'default';
    case 'Medium':
      return 'secondary';
    case 'Hard':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getDifficultyColor = (difficulty: Flashcard['difficulty']) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  flashcard,
  onEdit,
  onDelete,
  viewMode = 'grid',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: categories = [], error: categoriesError } =
    useGetCategoriesQuery();
  const { toast } = useToast();

  useEffect(() => {
    if (categoriesError) {
      toast({
        title: 'Error',
        description: 'Failed to load categories.',
        variant: 'destructive',
      });
    }
  }, [categoriesError, toast]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : categoryId;
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(flashcard);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = flashcard._id || flashcard.id;
    if (id) {
      onDelete?.(id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-xs border-blue-200 text-blue-700 bg-blue-50 max-w-32"
              >
                <span className="truncate block">
                  {getCategoryName(flashcard.category)}
                </span>
              </Badge>
              <Badge
                className={`text-xs border ${getDifficultyColor(flashcard.difficulty)}`}
              >
                {flashcard.difficulty}
              </Badge>
              {flashcard.isAIGenerated && (
                <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <p
              className="font-medium text-gray-900 truncate mb-1"
              title={flashcard.front}
            >
              {flashcard.front}
            </p>
            <div className="flex flex-wrap gap-1">
              {flashcard.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  className="text-xs border-gray-200 max-w-40"
                  style={{ backgroundColor: '#673ab6', color: 'white' }}
                >
                  <span className="truncate block">{tag}</span>
                </Badge>
              ))}
              {flashcard.tags.length > 3 && (
                <Badge
                  className="text-xs border-gray-200"
                  style={{ backgroundColor: '#673ab6', color: 'white' }}
                >
                  +{flashcard.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFlip}
              className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
            >
              {isFlipped ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        {isFlipped && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p
              className="text-sm text-gray-800 leading-relaxed line-clamp-3"
              title={flashcard.back}
            >
              {flashcard.back}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white h-80 rounded-lg shadow-sm border border-gray-200 flex flex-col relative group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onClick={toggleFlip}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs border-blue-200 text-blue-700 bg-blue-50 max-w-24"
          >
            <span className="truncate block">
              {getCategoryName(flashcard.category)}
            </span>
          </Badge>
          <Badge
            className={`text-xs border ${getDifficultyColor(flashcard.difficulty)}`}
          >
            {flashcard.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {flashcard.isAIGenerated && (
            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
              <Brain className="h-2.5 w-2.5 mr-1" />
              AI
            </Badge>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-blue-600"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          {isFlipped ? (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <EyeOff className="h-5 w-5 text-green-600" />
              </div>
              <p
                className="text-sm text-gray-800 font-medium leading-relaxed line-clamp-4"
                title={flashcard.back}
              >
                {flashcard.back}
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <p
                className="text-sm text-gray-800 font-medium leading-relaxed line-clamp-4"
                title={flashcard.front}
              >
                {flashcard.front}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-2 space-y-3 border-t border-gray-100">
        {flashcard.source && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
            <span className="font-medium">Source:</span>{' '}
            <span className="truncate block" title={flashcard.source}>
              {flashcard.source}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {flashcard.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                className="text-xs border-gray-200 max-w-32"
                style={{ backgroundColor: '#673ab6', color: 'white' }}
              >
                <span className="truncate block">{tag}</span>
              </Badge>
            ))}
            {flashcard.tags.length > 2 && (
              <Badge
                className="text-xs border-gray-200"
                style={{ backgroundColor: '#673ab6', color: 'white' }}
              >
                +{flashcard.tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <RotateCcw className="h-2.5 w-2.5 mr-1 group-hover:text-blue-600 transition-colors duration-200" />
            <span>Click to flip</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardItem;
