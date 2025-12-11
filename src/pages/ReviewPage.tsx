import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  Check,
  RefreshCw,
  BarChart3,
  BookOpen,
  Sparkles,
  Library,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  useGetDueFlashcardsQuery,
  useSubmitReviewMutation,
  useGetReviewStatisticsQuery,
} from '../features/vocabulary/services/reviewApi';
import { useGetCategoriesQuery } from '../features/flashcard/services/flashcardApi';
import type { Flashcard } from '../features/vocabulary/types/review.types';
import type { Category } from '../features/flashcard/types/flashcard.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [reviewLimit, setReviewLimit] = useState(20);
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: categories = [] } = useGetCategoriesQuery();
  const {
    data: dueData,
    isLoading: loadingDue,
    refetch,
  } = useGetDueFlashcardsQuery({
    limit: reviewLimit,
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
  });
  const { data: statistics } = useGetReviewStatisticsQuery({
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
  });
  const [submitReview, { isLoading: reviewing }] = useSubmitReviewMutation();

  const flashcards = dueData?.flashcards || [];
  const sessionComplete = !loadingDue && flashcards.length === 0;
  const loading = loadingDue;

  const handleReview = async (result: 'forgot' | 'remember') => {
    if (reviewing || !flashcards[currentIndex]) return;

    try {
      const currentCard = flashcards[currentIndex];

      await submitReview({
        flashcardId: currentCard._id,
        result,
      }).unwrap();

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        refetch();
        setCurrentIndex(0);
        setIsFlipped(false);
      }

      toast.success(
        result === 'remember'
          ? 'Great job! This card will appear in a few days'
          : 'Will review soon. This card will appear again sooner'
      );
    } catch (error) {
      toast.error('Failed to save review result');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleStartNewSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete || flashcards.length === 0) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Category Selector for empty state */}
        <div className="mb-4 bg-white dark:bg-slate-800 rounded-lg p-3 border shadow-sm">
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((cat): cat is Category & { _id: string } =>
                    Boolean(cat._id && cat._id.trim() !== '')
                  )
                  .map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              value={reviewLimit.toString()}
              onValueChange={(v) => setReviewLimit(Number(v))}
            >
              <SelectTrigger className="w-[100px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border-2 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-b py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-lg">
                {flashcards.length === 0 ? '🎯' : '🎉'}
              </div>
              <CardTitle className="text-xl">
                {flashcards.length === 0
                  ? 'No Cards Due!'
                  : 'Session Complete!'}
              </CardTitle>
            </div>
            <CardDescription className="text-sm">
              {flashcards.length === 0
                ? selectedCategory === 'all'
                  ? 'Great work! Try another category or add more words.'
                  : 'All caught up in this category! Try another one.'
                : 'Well done! Continue or try another category.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4 space-y-4">
            {flashcards.length > 0 ? (
              <Button
                onClick={handleStartNewSession}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Review More
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2"
                onClick={() => navigate('/vocabulary')}
              >
                <Library className="h-5 w-5 mr-2" />
                Browse Vocabulary Library
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = (currentIndex / flashcards.length) * 100;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Compact Session Controls */}
      <div className="mb-4 bg-white dark:bg-slate-800 rounded-lg p-3 border shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
                  .filter((cat): cat is Category & { _id: string } =>
                    Boolean(cat._id && cat._id.trim() !== '')
                  )
                  .map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              value={reviewLimit.toString()}
              onValueChange={(v) => setReviewLimit(Number(v))}
            >
              <SelectTrigger className="w-[90px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-2.5 py-1">
              {currentIndex + 1} / {flashcards.length}
            </Badge>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs flex items-center gap-1">
                    💡 How to Review
                  </h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p>
                      <strong>1.</strong> Look at the English word
                    </p>
                    <p>
                      <strong>2.</strong> Try to recall the meaning
                    </p>
                    <p>
                      <strong>3.</strong> Click to reveal answer
                    </p>
                    <p>
                      <strong>4.</strong> Rate yourself
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mt-3" />
      </div>

      {/* Flashcard - Focus on content */}
      <Card className="border-2 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Lv {currentCard.level_memory}
            </Badge>
            {currentCard.category && (
              <Badge variant="secondary" className="text-xs">
                {typeof currentCard.category === 'object'
                  ? currentCard.category.name
                  : currentCard.category}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6 pb-6">
          {/* Card Display */}
          <div
            className={`min-h-[280px] flex items-center justify-center p-8 rounded-lg cursor-pointer transition-all duration-300 ${
              !isFlipped
                ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 hover:shadow-lg border-2 border-blue-200 dark:border-blue-800'
                : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 hover:shadow-lg border-2 border-emerald-200 dark:border-emerald-800'
            }`}
            onClick={handleFlip}
          >
            <div className="text-center max-w-2xl">
              {!isFlipped ? (
                <div className="space-y-3">
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
                    {currentCard.front}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    💭 Click to reveal answer
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-3xl font-semibold text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    {currentCard.back}
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Did you remember?
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isFlipped ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleReview('forgot')}
                disabled={reviewing}
                className="h-14 border-2 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 font-semibold"
              >
                <X className="h-5 w-5 mr-2" />
                Forgot
              </Button>
              <Button
                size="lg"
                onClick={() => handleReview('remember')}
                disabled={reviewing}
                className="h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-md"
              >
                <Check className="h-5 w-5 mr-2" />
                Remember
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={handleFlip}
              className="w-full h-14 border-2 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Show Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {statistics && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-medium mb-0.5 uppercase tracking-wide">
              Remaining
            </p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
              {flashcards.length - currentIndex}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mb-0.5 uppercase tracking-wide">
              Total Due
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {statistics.dueForReview}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-0.5 uppercase tracking-wide">
              Mastered
            </p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              {statistics.percentMastered.toFixed(0)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
