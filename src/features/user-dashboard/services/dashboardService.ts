import type {
  DashboardData,
  DailyLessonData,
  CompetencyProfileInsightResponse,
} from '../types/dashboard.types';
import type { RoadmapApiResponse } from '../types/roadmap.types';
import {
  transformCompetencyData,
  calculateLearningStatsFromRoadmap,
} from './dashboardApi';

// Get complete dashboard data using real API data only
export const fetchDashboardData = (
  competencyData: CompetencyProfileInsightResponse,
  roadmapData?: RoadmapApiResponse['data'],
  dailyLessonData?: DailyLessonData | null
): DashboardData => {
  try {
    // Transform real data from API
    const transformedData = transformCompetencyData(competencyData.data);

    // Calculate learning stats from roadmap if available
    const learningStats = roadmapData
      ? calculateLearningStatsFromRoadmap(roadmapData, dailyLessonData)
      : null;

    // Return dashboard data using only real API data
    return {
      userProfile: {
        id: transformedData.userProfile?.id || '1',
        name: transformedData.userProfile?.name || 'User',
        email: transformedData.userProfile?.email || '',
        currentScore: transformedData.scoreData!.overallScore,
        targetScore: transformedData.scoreData!.targetScore,
        currentLevel: transformedData.scoreData!.cefrLevel,
        studyStreak: learningStats?.currentStreak || 0,
        longestStreak: learningStats?.longestStreak || 0,
      },
      scoreData: transformedData.scoreData!,
      skillsData: transformedData.skillsData!,
      aiInsights: transformedData.aiInsights!,
      partPerformance: [],
      learningPhases: [],
      dailyTasks: [],
      weeklyPlan: [],
      learningStats: learningStats || {
        currentStreak: 0,
        longestStreak: 0,
        todayProgress: 0,
        weeklyGoal: 0,
        weeklyCompleted: 0,
        totalStudyTime: 0,
        averageDaily: 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};
