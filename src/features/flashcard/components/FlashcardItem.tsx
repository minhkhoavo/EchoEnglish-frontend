import React, { useState, useEffect } from 'react';
import type { Flashcard } from '../types/flashcard.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Eye, EyeOff, Edit, Trash2, Volume2 } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/flashcardApi';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface FlashcardItemProps {
  flashcard: Flashcard;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (id: string) => void;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  selectionMode?: boolean;
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
  isSelected = false,
  onSelect,
  selectionMode = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: categories = [], error: categoriesError } =
    useGetCategoriesQuery();
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    if (categoriesError) {
      toast.error('Failed to load categories.');
    }
  }, [categoriesError]);

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
    const id = flashcard._id;
    if (id) {
      onDelete?.(id);
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`bg-gradient-to-r from-white via-gray-50/30 to-white rounded-xl shadow-sm border p-5 hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 group backdrop-blur-sm ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200/60'}`}
      >
        <div className="flex items-center gap-4">
          {selectionMode && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                flashcard._id && onSelect?.(flashcard._id, checked as boolean)
              }
              className="mt-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-3">
              <Badge
                variant="outline"
                className="text-xs font-medium border-blue-200/80 text-blue-700 bg-blue-50/80 backdrop-blur-sm shadow-sm max-w-32"
              >
                <span className="truncate block">
                  {getCategoryName(flashcard.category)}
                </span>
              </Badge>
              <Badge
                className={`text-xs font-medium border shadow-sm backdrop-blur-sm ${getDifficultyColor(flashcard.difficulty)}`}
              >
                {flashcard.difficulty}
              </Badge>
              {flashcard.isAIGenerated && (
                <Badge className="text-xs font-medium bg-purple-100/90 text-purple-800 border-purple-200/80 shadow-sm backdrop-blur-sm">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <p
                className="font-semibold text-gray-900 text-base tracking-wide flex-1"
                title={flashcard.front}
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {flashcard.front}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(flashcard.front, 'en-US');
                }}
                className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 flex-shrink-0"
              >
                <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </div>
            {flashcard.phonetic && (
              <p className="text-xs text-muted-foreground font-mono mb-2">
                /{flashcard.phonetic}/
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {flashcard.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  className="text-xs font-medium border-0 shadow-sm max-w-40 bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                >
                  <span className="truncate block">{tag}</span>
                </Badge>
              ))}
              {flashcard.tags.length > 3 && (
                <Badge className="text-xs font-medium border-0 shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  +{flashcard.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFlip}
              className="h-9 w-9 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-300/60 transition-all duration-200"
            >
              {isFlipped ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-300/60 transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 text-gray-600 hover:text-red-600 hover:bg-red-50/80 hover:border-red-300/60 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {isFlipped && (
          <div className="text-center mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-xl border border-blue-200/60 shadow-sm max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            <div className="flex items-center justify-center gap-2">
              <p
                className="text-sm text-gray-800 leading-relaxed font-medium tracking-wide"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {flashcard.back}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(flashcard.back, 'vi-VN');
                }}
                className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900 flex-shrink-0"
              >
                <Volume2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-white to-gray-50/30 h-80 rounded-xl shadow-sm border flex flex-col relative group cursor-pointer hover:shadow-xl hover:border-blue-300/40 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-sm ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200/60'}`}
      onClick={toggleFlip}
    >
      {selectionMode && (
        <div
          className="absolute top-2 left-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              flashcard._id && onSelect?.(flashcard._id, checked as boolean)
            }
            className="bg-white shadow-md"
          />
        </div>
      )}
      {/* Header with floating effect */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs font-medium border-blue-200/80 text-blue-700 bg-blue-50/80 backdrop-blur-sm shadow-sm max-w-24"
            >
              <span className="truncate block">
                {getCategoryName(flashcard.category)}
              </span>
            </Badge>
            <Badge
              className={`text-xs font-medium border shadow-sm backdrop-blur-sm ${getDifficultyColor(flashcard.difficulty)}`}
            >
              {flashcard.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {flashcard.isAIGenerated && (
              <Badge className="text-xs font-medium bg-purple-100/90 text-purple-800 border-purple-200/80 shadow-sm backdrop-blur-sm">
                <Brain className="h-2.5 w-2.5 mr-1" />
                AI
              </Badge>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-7 w-7 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-300/60 transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-7 w-7 p-0 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-200/50 text-gray-600 hover:text-red-600 hover:bg-red-50/80 hover:border-red-300/60 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content with enhanced typography and spacing */}
      <div className="flex-1 flex items-start justify-center p-6 pt-16 pb-20 overflow-hidden">
        <div className="text-center w-full h-full flex flex-col">
          {isFlipped ? (
            <div className="space-y-3 h-full flex flex-col">
              <div className="w-full text-center flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full mb-4 opacity-80"></div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 px-2 flex flex-col items-center justify-center gap-3">
                <p
                  className="text-base text-gray-800 font-medium leading-relaxed tracking-wide text-center"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {flashcard.back}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(flashcard.back, 'vi-VN');
                  }}
                  className="hover:bg-green-100 dark:hover:bg-green-900"
                >
                  <Volume2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 h-full flex flex-col">
              <div className="w-full text-center flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mb-4 opacity-80"></div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 px-2 flex flex-col items-center justify-center gap-3">
                <p
                  className="text-lg text-gray-900 font-semibold leading-relaxed tracking-wide text-center"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  {flashcard.front}
                </p>
                {flashcard.phonetic && (
                  <p className="text-sm text-muted-foreground font-mono">
                    /{flashcard.phonetic}/
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(flashcard.front, 'en-US');
                  }}
                  className="hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer with glassmorphism effect */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200/50 rounded-b-xl p-4 space-y-3">
        {flashcard.source && (
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100/60 backdrop-blur-sm p-2.5 rounded-lg border border-gray-200/40">
            <span className="font-semibold text-gray-600">Source:</span>
            <span className="truncate font-medium" title={flashcard.source}>
              {flashcard.source}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {flashcard.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                className="text-xs font-medium border-0 shadow-sm max-w-32 bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
              >
                <span className="truncate block">{tag}</span>
              </Badge>
            ))}
            {flashcard.tags.length > 2 && (
              <Badge className="text-xs font-medium border-0 shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                +{flashcard.tags.length - 2}
              </Badge>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-600 font-medium">
            <div className="w-1 h-1 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
            <span>Tap to reveal</span>
          </div>
        </div>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-tr-xl pointer-events-none"></div>
    </div>
  );
};

export default FlashcardItem;
