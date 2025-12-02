import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Zap, BarChart3 } from 'lucide-react';
import FlashcardBoard from '@/features/flashcard/components/FlashcardBoard';
import ReviewPage from './ReviewPage';
import FlashcardStatistics from '@/features/flashcard/components/FlashcardStatistics';

export default function FlashcardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('flashcards');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['flashcards', 'review', 'statistics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="h-full flex flex-col"
      >
        <div className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b px-6 pt-6 pb-4">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-12 bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger
              value="flashcards"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all"
            >
              <BookOpen className="h-4 w-4" />
              <span className="font-medium">My Flashcards</span>
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all"
            >
              <Zap className="h-4 w-4" />
              <span className="font-medium">Review</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Statistics</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="flashcards" className="flex-1 m-0 overflow-hidden">
          <FlashcardBoard />
        </TabsContent>

        <TabsContent value="review" className="flex-1 m-0 overflow-auto">
          <ReviewPage />
        </TabsContent>

        <TabsContent value="statistics" className="flex-1 m-0 overflow-auto">
          <FlashcardStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
