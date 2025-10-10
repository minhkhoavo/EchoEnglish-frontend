import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExamTabsSection } from '@/features/exam-attempts/components/ExamTabsSection';
import { useAppSelector, useAppDispatch } from '@/core/store/store';
import {
  setFilter,
  setListeningReadingAttempts,
} from '@/features/exam-attempts/slices/examAttemptsSlice';
import {
  useGetSpeakingAttemptsQuery,
  useGetListeningReadingResultsQuery,
} from '@/features/exam-attempts/services/examAttemptsApi';
import type { ExamAttempt, ExamType } from '@/features/exam-attempts/types';

const ExamAttemptsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ExamType>('listening-reading');

  // Reset filters to default when switching tabs
  useEffect(() => {
    dispatch(setFilter({ sortBy: 'date', sortOrder: 'desc' }));
  }, [activeTab, dispatch]);

  const { listeningReading, writing, loading, error, filters } = useAppSelector(
    (state) => state.examAttempts
  );
  // RTK Query hooks
  const {
    data: speakingData,
    isLoading: speakingLoading,
    error: speakingError,
    refetch: refetchSpeaking,
  } = useGetSpeakingAttemptsQuery();

  const {
    data: listeningReadingData,
    isLoading: listeningReadingLoading,
    refetch: refetchListeningReading,
  } = useGetListeningReadingResultsQuery();

  // Update listeningReading in slice when API data loads
  useEffect(() => {
    if (listeningReadingData) {
      dispatch(setListeningReadingAttempts(listeningReadingData));
    }
  }, [listeningReadingData, dispatch]);

  const speaking = useMemo(() => speakingData || [], [speakingData]);
  const effectiveListeningReading = useMemo(
    () => listeningReading,
    [listeningReading]
  );

  // Refresh functions
  const refreshSpeakingAttempts = () => {
    refetchSpeaking();
  };

  const refreshListeningReading = () => {
    refetchListeningReading();
  };

  // Get current tab's data
  const currentTabData = useMemo(() => {
    switch (activeTab) {
      case 'listening-reading':
        return effectiveListeningReading;
      case 'speaking':
        return speaking;
      case 'writing':
        return writing;
      default:
        return [];
    }
  }, [activeTab, effectiveListeningReading, speaking, writing]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data: ExamAttempt[] = [...currentTabData];

    // Filter by status
    if (filters.status !== 'all') {
      data = data.filter((attempt) => attempt.status === filters.status);
    }

    // Sort data
    data = data.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (filters.sortBy) {
        case 'date':
          aValue = new Date(a.startedAt).getTime();
          bValue = new Date(b.startedAt).getTime();
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return data;
  }, [currentTabData, filters]);

  // Calculate counts for current tab
  const counts = useMemo(() => {
    return {
      total: currentTabData.length,
      completed: currentTabData.filter((a) => a.status === 'completed').length,
      inProgress: currentTabData.filter((a) => a.status === 'in-progress')
        .length,
      notStarted: currentTabData.filter((a) => a.status === 'not-started')
        .length,
    };
  }, [currentTabData]);

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      dispatch(setFilter({ [key]: value }));
    });
  };

  const handleViewDetails = (id: string) => {
    if (activeTab === 'speaking') {
      navigate(`/speaking-result?id=${id}`);
    } else {
      navigate(`/me/tests/${id}/analysis`);
    }
  };

  const handleContinue = (id: string) => {
    console.log('Continue exam:', id);
  };

  const handleNewTest = () => {
    navigate('/tests');
  };

  const isCurrentTabLoading = () => {
    if (activeTab === 'speaking') return loading.speaking || speakingLoading;
    if (activeTab === 'listening-reading')
      return loading.listeningReading || listeningReadingLoading;
    if (activeTab === 'writing') return loading.writing;
    return false;
  };

  const getCurrentTabError = (): string | null => {
    if (activeTab === 'speaking') return error.speaking;
    if (activeTab === 'listening-reading') return error.listeningReading;
    if (activeTab === 'writing') return error.writing;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                  Exam Attempts
                </h1>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              </div>
              <p className="text-slate-600 text-base leading-relaxed max-w-md">
                Track your TOEIC test progress, review past attempts, and
                continue unfinished exams
              </p>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-3">
              <Button
                onClick={handleNewTest}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-xl font-medium"
                size="default"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start New Test
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <ExamTabsSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          data={{ listeningReading, speaking, writing }}
          filteredData={filteredData}
          filters={filters}
          counts={counts}
          loading={isCurrentTabLoading()}
          error={getCurrentTabError()}
          onFiltersChange={handleFiltersChange}
          onRefresh={refreshSpeakingAttempts}
          onViewDetails={handleViewDetails}
          onContinue={handleContinue}
        />
      </div>
    </div>
  );
};

export default ExamAttemptsPage;
