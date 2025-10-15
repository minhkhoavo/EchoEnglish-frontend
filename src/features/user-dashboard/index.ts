export {
  ScoreOverview,
  SkillsRadar,
  LearningJourney,
  WeeklyProgress,
  AIInsights,
  LearningStats,
} from './components';
export { UserDashboardPage } from './pages/UserDashboardPage';
export { fetchDashboardData } from './services/dashboardService';
export { useGetLearningStatsQuery } from './services/dashboardApi';
export type {
  UserProfile,
  ScoreData,
  SkillData,
  PartPerformance,
  LearningPhase,
  DailyTask,
  WeeklySession,
  WeeklyPlan,
  VocabularyPlan,
  LearningStats as LearningStatsType,
  AIInsight,
  StudyGoal,
  Milestone,
  DashboardData,
} from './types/dashboard.types';
