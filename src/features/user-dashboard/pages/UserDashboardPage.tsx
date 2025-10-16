import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  Brain,
  Calendar,
  Target,
  TrendingUp,
  Menu,
  BookOpen,
} from 'lucide-react';
import {
  ScoreOverview,
  SkillsRadar,
  LearningJourney,
  DailyLesson,
  WeeklyProgress,
  AIInsights,
  LearningStatsSidebar,
  StudyPreferencesCard,
} from '../components';
import {
  fetchDashboardData,
  // fetchStudyPreferences,
} from '../services/dashboardService';
import {
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
} from '../slices/dashboardSlice';
import {
  useGetCompetencyInsightsQuery,
  useGetDailyLessonQuery,
  useCompleteLessonItemMutation,
  useGetStudyPreferencesQuery,
} from '../services/dashboardApi';
import type { AIInsight, DashboardData } from '../types/dashboard.types';
import type { StudyPreferences } from '../components/StudyPreferences';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const UserDashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux selectors
  const dashboardData = useAppSelector(selectDashboardData);
  const dashboardLoading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  // RTK Query hooks
  const {
    data: competencyData,
    isLoading: competencyLoading,
    error: competencyError,
  } = useGetCompetencyInsightsQuery();
  const { data: dailyLessonResponse, isLoading: dailyLessonQueryLoading } =
    useGetDailyLessonQuery();

  // Extract daily lesson from response
  const dailyLesson = dailyLessonResponse?.data || null;
  const dailyLessonLoading = dailyLessonQueryLoading;

  const [completeLessonItemMutation] = useCompleteLessonItemMutation();
  const {
    data: studyPreferencesData,
    isLoading: studyPreferencesLoading,
    error: studyPreferencesError,
  } = useGetStudyPreferencesQuery();

  // Local state
  const [studyPreferences, setStudyPreferences] =
    useState<StudyPreferences | null>(null);

  useEffect(() => {
    if (studyPreferencesData) {
      setStudyPreferences(studyPreferencesData);
    }
  }, [studyPreferencesData]);

  // Combine API data with static data when competency data is available
  const combinedDashboardData = competencyData
    ? fetchDashboardData(competencyData)
    : null;

  // Event handlers
  const handleLessonItemComplete = async (itemId: string) => {
    try {
      await completeLessonItemMutation(itemId).unwrap();
    } catch (error) {
      console.error('Failed to complete lesson item:', error);
    }
  };

  const handleInsightAction = (insight: AIInsight) => {
    console.log('Action clicked:', insight);
    // if (insight.actionUrl) {
    //   navigate(insight.actionUrl);
    // }
  };

  const anyLoadingFlag =
    dashboardLoading ||
    competencyLoading ||
    dailyLessonQueryLoading ||
    studyPreferencesLoading;

  if (anyLoadingFlag) {
    return (
      <div
        className="min-h-screen flex w-full"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-600">
              Loading your dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!combinedDashboardData) {
    return (
      <div
        className="min-h-screen flex w-full"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-red-600">
              Failed to load dashboard
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (studyPreferencesLoading) {
    return <div>Loading study preferences...</div>;
  }

  if (studyPreferencesError) {
    if ('message' in studyPreferencesError) {
      return (
        <div>
          Error loading study preferences: {studyPreferencesError.message}
        </div>
      );
    } else {
      return <div>Error loading study preferences.</div>;
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col w-full"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-4 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 hidden sm:flex"
              >
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Welcome Section */}
              <div className="text-center mb-6">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: '#1F2937' }}
                >
                  Welcome back, {combinedDashboardData.userProfile.name}!
                </h2>
                <p className="text-lg" style={{ color: '#6B7280' }}>
                  Your personalized TOEIC learning journey
                </p>
              </div>

              {/* Main Content with Sidebar Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* AI Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Brain
                          className="h-5 w-5 mr-2"
                          style={{ color: '#8B5CF6' }}
                        />
                        AI-Powered Insights
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Personalized recommendations based on your performance
                      </p>
                    </CardHeader>
                    <CardContent>
                      <AIInsights
                        insights={combinedDashboardData.aiInsights}
                        onActionClick={handleInsightAction}
                      />
                    </CardContent>
                  </Card>

                  {/* Score and Skills Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ScoreOverview
                      scoreData={combinedDashboardData.scoreData}
                    />
                    <SkillsRadar
                      skillsData={combinedDashboardData.skillsData}
                    />
                  </div>

                  {/* Part Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp
                          className="h-5 w-5 mr-2"
                          style={{ color: '#3B82F6' }}
                        />
                        Performance by TOEIC Listening & Reading
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={combinedDashboardData.partPerformance}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                            />
                            <XAxis dataKey="part" tick={{ fill: '#6B7280' }} />
                            <YAxis tick={{ fill: '#6B7280' }} />
                            <Tooltip />
                            <Bar
                              dataKey="score"
                              fill="#3B82F6"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Preferences */}
                  {studyPreferences && (
                    <StudyPreferencesCard
                      preferences={studyPreferences}
                      onEdit={() => navigate('/settings')}
                    />
                  )}
                </div>

                {/* Right Sidebar - Stats */}
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-24">
                    <LearningStatsSidebar
                      stats={combinedDashboardData.learningStats}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Daily Practice Tab */}
            <TabsContent value="practice" className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: '#1F2937' }}
                  >
                    Today's Lessons
                  </h2>
                  <p className="text-muted-foreground">
                    AI-recommended exercises based on your weak points
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {
                    combinedDashboardData.dailyTasks.filter((t) => t.completed)
                      .length
                  }
                  /{combinedDashboardData.dailyTasks.length} Completed
                </Badge>
              </div>

              {/* Daily Lesson */}
              <DailyLesson
                dailyLesson={dailyLesson}
                loading={dailyLessonLoading}
                onItemComplete={handleLessonItemComplete}
              />

              {/* Motivational Footer */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 sm:p-6 text-center">
                  <h3
                    className="text-base sm:text-lg font-semibold mb-2"
                    style={{ color: '#1F2937' }}
                  >
                    💡 Quality over Quantity
                  </h3>
                  <p
                    className="text-xs sm:text-sm"
                    style={{ color: '#4B5563' }}
                  >
                    Each exercise is specifically chosen to target your
                    weaknesses. Focus on understanding explanations when you
                    make mistakes.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weekly Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              {/* Learning Journey */}
              <LearningJourney />

              {/* Weekly Progress */}
              <WeeklyProgress />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
