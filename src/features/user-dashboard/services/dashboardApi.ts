import { api } from '../../../core/api/api';
import type {
  CompetencyProfileInsightResponse,
  DailyLessonData,
  DashboardData,
  TrackResourceTimeRequest,
  CompletePracticeDrillRequest,
} from '../types/dashboard.types';
import type {
  RoadmapApiResponse,
  TransformedPhase,
  TransformedWeeklyLesson,
} from '../types/roadmap.types';
import type { StudyPreferences } from '../components/StudyPreferences';

// Extend the main API slice with dashboard-specific endpoints
export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch competency insights
    getCompetencyInsights: builder.query<
      CompetencyProfileInsightResponse,
      void
    >({
      query: () => ({
        url: '/users/competency-profile/insights',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Fetch daily lesson
    getDailyLesson: builder.query<{ data: DailyLessonData | null }, void>({
      query: () => ({
        url: '/learning-plans/today',
        method: 'GET',
      }),
      providesTags: ['DailyLesson'],
    }),

    // Complete lesson item
    completeLessonItem: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/learning-plans/items/${itemId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['DailyLesson'],
    }),

    // Update lesson progress
    updateLessonProgress: builder.mutation<
      void,
      { lessonId: string; progress: number }
    >({
      query: ({ lessonId, progress }) => ({
        url: `/learning-plans/${lessonId}/progress`,
        method: 'PATCH',
        data: { progress },
      }),
      invalidatesTags: ['DailyLesson'],
    }),

    // Update task completion (keeping for now, though it's currently mocked)
    updateTaskCompletion: builder.mutation<
      void,
      { taskId: string; completed: boolean }
    >({
      query: ({ taskId, completed }) => ({
        url: `/tasks/${taskId}/completion`,
        method: 'PATCH',
        data: { completed },
      }),
      invalidatesTags: ['Dashboard'],
    }),

    // Get active roadmap
    getActiveRoadmap: builder.query<RoadmapApiResponse, void>({
      query: () => ({
        url: '/learning-plans/active',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Track resource time spent
    trackResourceTime: builder.mutation<void, TrackResourceTimeRequest>({
      query: ({ sessionId, itemId, resourceId, timeSpent }) => ({
        url: `/learning-plans/sessions/${sessionId}/items/${itemId}/resources/${resourceId}/track`,
        method: 'POST',
        data: { timeSpent },
      }),
      invalidatesTags: ['DailyLesson'],
    }),

    // Complete practice drill
    completePracticeDrill: builder.mutation<void, CompletePracticeDrillRequest>(
      {
        query: ({ sessionId, ...data }) => ({
          url: `/learning-plans/sessions/${sessionId}/practice-drill/complete`,
          method: 'POST',
          data,
        }),
        invalidatesTags: ['DailyLesson'],
      }
    ),

    getStudyPreferences: builder.query<StudyPreferences, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          data: {
            dailyGoal: 60,
            preferredTime: '19:00 - 21:00',
            targetScore: 800,
            currentScore: 650,
            studyDays: ['T2', 'T3', 'T4', 'T5', 'T6'],
            reminderEnabled: true,
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    getLearningStats: builder.query({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
          data: {
            currentStreak: 12,
            longestStreak: 28,
            todayGoal: 60,
            completed: 35,
            weeklyGoal: 420,
            weeklyCompleted: 285,
            totalStudyTime: 3450,
            averageDaily: 45,
          },
        };
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCompetencyInsightsQuery,
  useGetDailyLessonQuery,
  useCompleteLessonItemMutation,
  useUpdateLessonProgressMutation,
  useUpdateTaskCompletionMutation,
  useGetActiveRoadmapQuery,
  useTrackResourceTimeMutation,
  useCompletePracticeDrillMutation,
  useGetStudyPreferencesQuery,
  useGetLearningStatsQuery,
} = dashboardApi;

// Helper function to transform competency data (keeping existing logic)
const getActionUrlFromTitle = (title: string, actionText: string): string => {
  if (
    title.toLowerCase().includes('grammar') ||
    actionText.toLowerCase().includes('grammar')
  ) {
    return '/practice/grammar';
  }
  if (
    title.toLowerCase().includes('vocabulary') ||
    actionText.toLowerCase().includes('vocabulary')
  ) {
    return '/practice/vocabulary';
  }
  if (title.toLowerCase().includes('listening')) {
    return '/practice/listening';
  }
  if (title.toLowerCase().includes('reading')) {
    return '/practice/reading';
  }
  if (title.toLowerCase().includes('inference')) {
    return '/practice/inference';
  }
  return '/practice';
};

// Transform API data to dashboard format (keeping existing logic)
export const transformCompetencyData = (
  apiData: CompetencyProfileInsightResponse['data']
): Partial<DashboardData> => {
  // Transform skills data for radar chart
  const skillsData = apiData.skillsMap.map((skill) => ({
    skillName: skill.skillName,
    percentage: skill.percentage,
    lastUpdated: skill.lastUpdated,
    _id: skill._id,
  }));

  // Transform AI insights
  const aiInsights = apiData.aiInsights.map((insight) => ({
    _id: insight._id,
    title: insight.title,
    description: insight.description,
    actionText: insight.actionText,
    priority: insight.priority,
    createdAt: insight.createdAt,
    actionUrl: getActionUrlFromTitle(insight.title, insight.actionText),
  }));

  // Transform score data
  const scoreData = {
    overallScore: apiData.scorePrediction.overallScore,
    targetScore: apiData.scorePrediction.targetScore,
    listeningScore: apiData.scorePrediction.listeningScore,
    readingScore: apiData.scorePrediction.readingScore,
    cefrLevel: apiData.scorePrediction.cefrLevel,
    summary: apiData.scorePrediction.summary,
    lastUpdated: apiData.scorePrediction.lastUpdated,
  };

  return {
    scoreData,
    skillsData,
    aiInsights,
  };
};

// Transform roadmap data for UI components
export const transformRoadmapData = (
  roadmapData: RoadmapApiResponse['data']
) => {
  // Define colors for phases
  const phaseColors = [
    { color: '#3B82F6', bgColor: '#DBEAFE' },
    { color: '#10B981', bgColor: '#D1FAE5' },
    { color: '#F59E0B', bgColor: '#FEF3C7' },
    { color: '#8B5CF6', bgColor: '#EDE9FE' },
  ];

  // Transform phase summary to learning phases
  const learningPhases: TransformedPhase[] = roadmapData.phaseSummary.map(
    (phase, index) => ({
      phase: index + 1,
      weekRange: phase.weekRange,
      title: phase.phaseTitle,
      status: phase.status,
      targetScore: phase.targetScore,
      color: phaseColors[index]?.color || '#6B7280',
      bgColor: phaseColors[index]?.bgColor || '#F3F4F6',
      description: phase.description,
      keyFocusAreas: phase.keyFocusAreas,
    })
  );

  // Transform weekly focuses to weekly lessons
  const weeklyLessons: TransformedWeeklyLesson[] =
    roadmapData.weeklyFocuses.map((week) => ({
      weekNumber: week.weekNumber,
      title: week.title,
      summary: week.summary,
      status: week.status,
      dailyLessons: week.dailyFocuses.map((daily) => ({
        focus: daily.focus,
        status: daily.status,
        dayOfWeek: daily.dayOfWeek,
      })),
      hasDetailedPlan: week.weekNumber <= 2, // Only first 2 weeks have detailed plans
    }));

  return {
    learningPhases,
    weeklyLessons,
    currentWeek: roadmapData.currentWeek,
    overallProgress: roadmapData.overallProgress,
    targetScore: roadmapData.targetScore,
    currentScore: roadmapData.currentScore,
  };
};
