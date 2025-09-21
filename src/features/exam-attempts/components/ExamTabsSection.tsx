import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw } from 'lucide-react';
import { ExamAttemptCard } from './ExamAttemptCard';
import { ExamFilters } from './ExamFilters';
import type { ExamAttempt, ExamType } from '../types';

interface TabConfig {
  value: ExamType;
  label: string;
  shortLabel: string;
  gradient: string;
}

const tabsConfig: TabConfig[] = [
  {
    value: 'listening-reading',
    label: 'Listening & Reading',
    shortLabel: 'L&R',
    gradient: 'from-purple-500 to-indigo-600',
  },
  {
    value: 'speaking',
    label: 'Speaking',
    shortLabel: 'Speaking',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    value: 'writing',
    label: 'Writing',
    shortLabel: 'Writing',
    gradient: 'from-teal-500 to-cyan-600',
  },
];

interface ExamTabsProps {
  activeTab: ExamType;
  onTabChange: (tab: ExamType) => void;
  data: {
    listeningReading: ExamAttempt[];
    speaking: ExamAttempt[];
    writing: ExamAttempt[];
  };
  filteredData: ExamAttempt[];
  filters: {
    status: 'all' | 'completed' | 'in-progress' | 'not-started';
    sortBy: 'date' | 'score' | 'title';
    sortOrder: 'asc' | 'desc';
  };
  counts: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  loading: boolean;
  error: string | null;
  onFiltersChange: (filters: Partial<ExamTabsProps['filters']>) => void;
  onRefresh?: () => void;
  onViewDetails: (id: string) => void;
  onContinue: (id: string) => void;
}

const EmptyState: React.FC<{ type: ExamType }> = ({ type }) => (
  <div className="text-center py-16">
    <div className="mb-6">
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        No {type} attempts found
      </h3>
      <p className="text-slate-500 max-w-md mx-auto">
        You haven't started any {type.replace('-', ' & ')} tests yet. Click "New
        Test" to begin your first attempt.
      </p>
    </div>
    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
      Start Your First Test
    </Button>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute inset-0"></div>
    </div>
    <p className="text-slate-600 mt-4 font-medium">
      Loading your exam attempts...
    </p>
  </div>
);

const ErrorState: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="text-center py-16">
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <FileText className="h-8 w-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">
      Failed to load data
    </h3>
    <p className="text-slate-500 mb-6">
      There was an error loading your exam attempts. Please try again.
    </p>
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-slate-200 hover:bg-slate-50"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
);

export const ExamTabsSection: React.FC<ExamTabsProps> = ({
  activeTab,
  onTabChange,
  data,
  filteredData,
  filters,
  counts,
  loading,
  error,
  onFiltersChange,
  onRefresh,
  onViewDetails,
  onContinue,
}) => {
  const getTabCount = (type: ExamType) => {
    switch (type) {
      case 'listening-reading':
        return data.listeningReading.length;
      case 'speaking':
        return data.speaking.length;
      case 'writing':
        return data.writing.length;
      default:
        return 0;
    }
  };

  const renderTabContent = (type: ExamType) => {
    const config = tabsConfig.find((tab) => tab.value === type);
    if (!config) return null;

    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return (
        <ErrorState onRetry={type === 'speaking' ? onRefresh : undefined} />
      );
    }

    if (filteredData.length === 0) {
      return <EmptyState type={type} />;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredData.map((attempt) => (
          <ExamAttemptCard
            key={attempt.id}
            attempt={attempt}
            onViewDetails={onViewDetails}
            onContinue={onContinue}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      {/* Compact Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Your Test Attempts
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Review and continue your TOEIC preparation
            </p>
          </div>
          {activeTab === 'speaking' && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="border-slate-200 hover:bg-slate-50 h-8 text-xs"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        <Tabs
          value={activeTab}
          onValueChange={(value) => onTabChange(value as ExamType)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-lg h-auto">
            {tabsConfig.map((tab) => {
              const count = getTabCount(tab.value);

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={`flex items-center justify-center py-2 px-3 rounded-md transition-all duration-200 font-medium text-xs ${
                    activeTab === tab.value
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <span className="mr-2">{tab.label}</span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1.5 py-0.5 ${
                      activeTab === tab.value
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Compact Filters */}
          <div className="mb-6">
            <ExamFilters
              currentFilters={filters}
              onFiltersChange={onFiltersChange}
              counts={counts}
            />
          </div>

          {/* Tab Content */}
          {tabsConfig.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {renderTabContent(tab.value)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
