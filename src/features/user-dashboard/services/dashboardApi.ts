import { api } from '../../../core/api/api';
import type {
  CompetencyProfileInsightResponse,
  DailyLessonData,
  DashboardData,
  TrackResourceTimeRequest,
  CompletePracticeDrillRequest,
  ListeningReadingChartResponse,
  CheckMissedSessionsResponse,
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
      //   providesTags: ['Dashboard'],
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
      //   providesTags: ['Dashboard'],
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

    // Get listening and reading chart data
    getListeningReadingChartData: builder.query<
      ListeningReadingChartResponse,
      void
    >({
      query: () => ({
        url: '/test-results/listening-reading/chart-data',
        method: 'GET',
      }),
      providesTags: ['Dashboard'],
    }),

    // Check for missed sessions
    checkMissedSessions: builder.query<CheckMissedSessionsResponse, void>({
      query: () => ({
        url: '/roadmap-calibration/check-missed',
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
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
  useGetListeningReadingChartDataQuery,
  useCheckMissedSessionsQuery,
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
      hasDetailedPlan: week.dailyFocuses.length > 0, // Show detailed plan only if dailyFocuses is not empty
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

// Calculate learning stats from roadmap and daily lesson data
export const calculateLearningStatsFromRoadmap = (
  roadmapData: RoadmapApiResponse['data'],
  dailyLessonData?: DailyLessonData | null
) => {
  const {
    studyTimePerDay,
    studyDaysPerWeek,
    sessionsCompleted,
    totalSessions,
  } = roadmapData;

  // Calculate current streak (based on sessions completed and study schedule)
  // Assuming 1 session = 1 day of study
  const currentStreak =
    sessionsCompleted > 0
      ? Math.floor(sessionsCompleted / studyDaysPerWeek)
      : 0;

  // Estimate longest streak based on total sessions so far (can be enhanced with backend data)
  const longestStreak = currentStreak > 0 ? currentStreak + 3 : 0;

  // Today's completed - from daily lesson data progress (if available)
  const todayProgress = dailyLessonData?.progress ?? 0;
  // Convert progress (0-100%) to minutes completed

  // Weekly progress: sessionsCompleted / totalSessions as percentage
  const weeklyProgress =
    totalSessions > 0 ? (sessionsCompleted / totalSessions) * 100 : 0;

  // Weekly goal: studyTimePerDay * studyDaysPerWeek
  const weeklyGoal = studyTimePerDay * studyDaysPerWeek;

  // Weekly completed: based on percentage from roadmap
  const weeklyCompletedMinutes = Math.round(
    (weeklyProgress / 100) * (weeklyGoal * 10)
  ); // Approximate based on overall progress

  // Total study time: calculate based on sessions completed and daily study time
  const totalStudyTime = sessionsCompleted * studyTimePerDay;

  // Average daily: total study time / number of study days so far
  const studyDaysCompleted = Math.max(sessionsCompleted, 1);
  const averageDaily = Math.round(totalStudyTime / studyDaysCompleted);

  return {
    currentStreak,
    longestStreak,
    todayProgress,
    weeklyGoal,
    weeklyProgress,
    weeklyCompleted: weeklyCompletedMinutes,
    totalStudyTime,
    averageDaily,
  };
};
