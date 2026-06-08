import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Zap,
  Target,
  Sparkles,
  Library,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { useGetReviewStatisticsQuery } from '@/features/vocabulary/services/reviewApi';
import { useGetCategoriesQuery } from '@/features/flashcard/services/flashcardApi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { Category } from '@/features/flashcard/types/flashcard.types';

export default function FlashcardStatistics() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: statistics, isLoading } = useGetReviewStatisticsQuery({
    categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
          <div className="h-96 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mx-auto p-8 max-w-7xl flex items-center justify-center h-full">
        <div className="text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-slate-400" />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            No statistics available
          </p>
          <Button onClick={() => navigate('/vocabulary')} className="mt-4">
            <Library className="h-4 w-4 mr-2" />
            Start Learning
          </Button>
        </div>
      </div>
    );
  }

  const levelLabels = [
    'New',
    'Learning',
    'Familiar',
    'Good',
    'Very Good',
    'Mastered',
  ];
  const levelColors = [
    'from-slate-50 to-gray-50 border-slate-200',
    'from-red-50 to-orange-50 border-red-200',
    'from-yellow-50 to-amber-50 border-yellow-200',
    'from-blue-50 to-cyan-50 border-blue-200',
    'from-indigo-50 to-purple-50 border-indigo-200',
    'from-green-50 to-emerald-50 border-green-200',
  ];
  const levelTextColors = [
    'text-slate-700 dark:text-slate-300',
    'text-red-700 dark:text-red-300',
    'text-yellow-700 dark:text-yellow-300',
    'text-blue-700 dark:text-blue-300',
    'text-indigo-700 dark:text-indigo-300',
    'text-green-700 dark:text-green-300',
  ];

  const masteryTrend =
    statistics.percentMastered > 50
      ? 'up'
      : statistics.percentMastered > 20
        ? 'stable'
        : 'down';

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Learning Statistics
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track your vocabulary mastery and progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-56">
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
            <Button size="lg" onClick={() => navigate('/vocabulary')}>
              <Library className="h-4 w-4 mr-2" />
              Add Words
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Cards"
          value={statistics.total}
          icon={BookOpen}
          subtitle="In your collection"
        />
        <StatCard
          label="Due Today"
          value={statistics.dueForReview}
          icon={Zap}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBgColor="bg-orange-100 dark:bg-orange-900"
          valueColor="text-orange-600 dark:text-orange-400"
          subtitle="Ready for review"
        />
        <StatCard
          label="Mastered"
          value={statistics.byLevel.level5}
          icon={TrendingUp}
          iconColor="text-green-600 dark:text-green-400"
          iconBgColor="bg-green-100 dark:bg-green-900"
          valueColor="text-green-600 dark:text-green-400"
          subtitle="Fully learned"
        />
        <StatCard
          label="Daily Goal"
          value={statistics.recommendedDaily}
          icon={Target}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBgColor="bg-blue-100 dark:bg-blue-900"
          valueColor="text-blue-600 dark:text-blue-400"
          subtitle="cards / day"
        />
      </div>

      {/* Progress by Level */}
      <Card className="rounded-xl mb-8">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Progress by Learning Level
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {[0, 1, 2, 3, 4, 5].map((level) => {
              const levelKey =
                `level${level}` as keyof typeof statistics.byLevel;
              const count = statistics.byLevel[levelKey] || 0;
              const percent =
                statistics.total > 0 ? (count / statistics.total) * 100 : 0;

              return (
                <div key={level} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-20 justify-center">
                        Level {level}
                      </Badge>
                      <span className="font-semibold">
                        {levelLabels[level]}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${levelTextColors[level]}`}
                      >
                        {count}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({percent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={percent}
                    className={`h-4 bg-gradient-to-r ${levelColors[level]}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
