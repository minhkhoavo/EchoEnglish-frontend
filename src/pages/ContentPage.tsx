import { useSelector, useDispatch } from 'react-redux';
import { Home, Upload, BookOpen, BarChart3, FileText } from 'lucide-react';

import { type RootState, type AppDispatch } from '@/core/store/store';
import {
  setActiveTab,
  setSidebarOpen,
  type ActiveTab,
} from '@/core/store/slices/uiSlice.';

import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentManager } from '@/features/content-manager/ContentManager';
import FlashcardPage from './FlashcardPage';
import TOEICTestsContent from '@/features/test/components/TOEICTestsContent';

const ContentPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { activeTab, isSidebarOpen } = useSelector(
    (state: RootState) => state.ui
  );

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Home,
      description: 'Overview & Quick Actions',
    },
    {
      id: 'content',
      name: 'Content Manager',
      icon: Upload,
      description: 'Upload & AI Analysis',
    },
    {
      id: 'flashcards',
      name: 'Study Cards',
      icon: BookOpen,
      description: 'Practice & Review',
    },
    {
      id: 'tests',
      name: 'TOEIC Tests',
      icon: FileText,
      description: 'Practice Tests Library',
    },
    {
      id: 'analytics',
      name: 'Progress',
      icon: BarChart3,
      description: 'Track Performance',
    },
  ];

  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab(tabId as ActiveTab));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ContentManager />;
      case 'content':
        return <ContentManager />;
      case 'flashcards':
        return <FlashcardPage />;
      case 'tests':
        return <TOEICTestsContent testsPerPage={1} />;
      case 'analytics':
        return (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Learning Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your TOEIC preparation progress
            </p>
            <Card className="modern-card">
              <CardContent className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive analytics will be available soon.
                </p>
                <Button>Get Notified</Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <ContentManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header
        sidebarOpen={isSidebarOpen}
        setSidebarOpen={(open) => dispatch(setSidebarOpen(open))}
      />
      <div className="flex">
        <Sidebar
          sidebarOpen={isSidebarOpen}
          activeTab={activeTab}
          navigation={navigation}
          onTabClick={handleTabClick}
        />
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-background/50 z-30 lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default ContentPage;
