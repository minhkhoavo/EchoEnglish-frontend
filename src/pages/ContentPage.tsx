import { useState } from 'react';
import {
  Home,
  Upload,
  BookOpen,
  BarChart3,
  FileText,
  Library,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentManager } from '@/features/content-manager/ContentManager';
import FlashcardsPage from './FlashcardsPage';
import AllTestsPage from './test/AllTestsPage';
import NewResourcePage from './resource/ResourcePage';
import { ToeicTestDetail } from '@/features/tests/components/lis-read/TOEICTestDetail';

type TabId =
  | 'dashboard'
  | 'content'
  | 'resources'
  | 'flashcards'
  | 'tests'
  | 'analytics';

const ContentPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [showTestDetail, setShowTestDetail] = useState(false);

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    // Reset test detail view when switching tabs
    if (tabId !== 'tests') {
      handleBackToTests();
    }
  };

  const handleTestSelect = (testId: string) => {
    setSelectedTestId(testId);
    setShowTestDetail(true);
  };

  const handleBackToTests = () => {
    setSelectedTestId(null);
    setShowTestDetail(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ContentManager />;
      case 'content':
        return <ContentManager />;
      case 'resources':
        return <NewResourcePage />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'tests':
        if (showTestDetail && selectedTestId) {
          return (
            <ToeicTestDetail
              testId={selectedTestId}
              onBack={handleBackToTests}
            />
          );
        }
        return <AllTestsPage onTestSelect={handleTestSelect} />;
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
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-6">{renderContent()}</div>
    </div>
  );
};

export default ContentPage;
