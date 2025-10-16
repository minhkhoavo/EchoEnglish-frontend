// Import types from lr-analyze for reuse
import type {
  LearningResource,
  WeaknessDrill,
} from '../../lr-analyze/types/analysis';

// API Response interfaces
export interface CompetencyProfileInsightResponse {
  message: string;
  data: {
    aiInsights: AIInsight[];
    scorePrediction: ScoreData;
    skillsMap: SkillData[];
    lastUpdated: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentScore: number;
  targetScore: number;
  currentLevel: string;
  studyStreak: number;
  longestStreak: number;
}

export interface ScoreData {
  overallScore: number;
  targetScore: number;
  listeningScore: number;
  readingScore: number;
  cefrLevel: string;
  summary: string;
  lastUpdated: string;
}

export interface SkillData {
  skillName: string;
  percentage: number;
  lastUpdated: string;
  _id: string;
}

export interface PartPerformance {
  part: string;
  score: number;
  total: number;
  questionsCorrect?: number;
  questionsTotal?: number;
}

export interface LearningPhase {
  phase: number;
  week: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  score: number;
  color: string;
  bgColor: string;
  description: string;
  achievements: string[];
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'grammar' | 'listening' | 'vocabulary' | 'reading' | 'speaking';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  estimatedXP?: number;
}

// Daily Lesson types based on API response
export interface DailyLessonTargetWeakness {
  skillKey: string;
  skillName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DailyLessonPlanItem {
  _id: string;
  priority: number;
  title: string;
  description: string;
  targetWeakness: DailyLessonTargetWeakness;
  skillsToImprove: string[];
  resources: LearningResource[];
  practiceDrills: WeaknessDrill[];
  progress: number;
  estimatedWeeks: number;
  activityType: 'learn' | 'practice';
  resourceType: 'generated' | 'external';
  order: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface DailyLessonData {
  _id: string;
  userId: string;
  roadmapRef: string;
  testResultId: string;
  planItems: DailyLessonPlanItem[];
  dayNumber: number;
  weekNumber: number;
  scheduledDate: string;
  title: string;
  description: string;
  targetSkills: string[];
  targetDomains: string[];
  targetWeaknesses: DailyLessonTargetWeakness[];
  totalEstimatedTime: number;
  totalTimeSpent: number;
  progress: number;
  status: 'upcoming' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface TrackResourceTimeRequest {
  sessionId: string;
  itemId: string;
  resourceId: string;
  timeSpent: number;
}

export interface CompletePracticeDrillRequest {
  sessionId: string;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
}

export interface WeeklySession {
  day: string;
  topic: string;
  duration: number;
  status: 'completed' | 'current' | 'upcoming';
}

export interface WeeklyPlan {
  week: number;
  theme: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  progress: number;
  sessions: WeeklySession[];
}

export interface VocabularyPlan {
  newWords: {
    count: number;
    topics: string[];
    estimatedTime: string;
    reason: string;
  };
  reviewWords: {
    count: number;
    source: string;
    topics: string[];
    estimatedTime: string;
    retention: number;
  };
  masterWords: {
    count: number;
    lastWeek: number;
    totalMastered: number;
  };
}

export interface LearningStats {
  currentStreak: number;
  longestStreak: number;
  todayGoal: number;
  completed: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  totalStudyTime: number;
  averageDaily: number;
}

export interface AIInsight {
  _id: string;
  title: string;
  description: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  actionUrl?: string;
}

export interface StudyGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  timeframe: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  progress?: number;
}

export interface Milestone {
  week: number;
  title: string;
  description: string;
  targetScore: number;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface DashboardData {
  userProfile: UserProfile;
  scoreData: ScoreData;
  skillsData: SkillData[];
  partPerformance: PartPerformance[];
  learningPhases: LearningPhase[];
  dailyTasks: DailyTask[];
  dailyLesson?: DailyLessonData; // New daily lesson data
  weeklyPlan: WeeklyPlan[];
  vocabularyPlan: VocabularyPlan;
  learningStats: LearningStats;
  aiInsights: AIInsight[];
  studyGoals: StudyGoal[];
  milestones: Milestone[];
}
