// Import types from lr-analyze for reuse
import type {
  LearningResource,
  WeaknessDrill,
} from '../../lr-analyze/types/analysis';

// Listening Reading Chart Data
export interface ListeningReadingChartItem {
  date: string;
  listeningScore?: number;
  readingScore?: number;
  totalScore?: number;
  testTitle?: string;
}

export interface ListeningReadingChartResponse {
  message: string;
  data: {
    timeline: ListeningReadingChartItem[];
  };
}

// API Response interfaces
export interface CompetencyProfileInsightResponse {
  message: string;
  data: {
    aiInsights: AIInsight[];
    scorePrediction: ScoreData;
    skillsMap: SkillData[];
    domainProficiency: DomainProficiencyItem[];
    lastUpdated: string;
  };
}

export interface DomainProficiencyItem {
  domain: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  lastPracticed?: string;
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
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
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

// ==================== STUDY MEMO (USER-PROVIDED MATERIAL) ====================

export interface StudyMemoMaterialRef {
  refType: 'file' | 'resource';
  refId: string;
}

export interface MemoDayPlanItem {
  order: number;
  focus: string;
  status?: 'pending' | 'in-progress' | 'done';
  _id?: string;
}

export interface MemoSupplementedWeakness {
  skillKey: string;
  skillName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason?: string;
}

export interface MemoAnalysisResult {
  isSuitable: boolean;
  suitabilityReason: string;
  cefrFit: string;
  warnings: string[];
  suggestedTotalDays: number;
  dayPlan: MemoDayPlanItem[];
  supplementedWeaknesses: MemoSupplementedWeakness[];
}

export interface ResolvedMemoMaterial {
  refType: 'file' | 'resource';
  refId: string;
  title: string;
  resourceType: string;
}

export interface AnalyzeMemoRequest {
  materials: StudyMemoMaterialRef[];
  note?: string;
  scope: 'date' | 'week';
  targetDate?: string;
  targetWeekNumber?: number;
  preferredDays?: number;
}

export interface AnalyzeMemoResponse {
  data: {
    analysis: MemoAnalysisResult;
    materials: ResolvedMemoMaterial[];
  };
}

export interface CreateMemoRequest extends AnalyzeMemoRequest {
  suitability: { isSuitable: boolean; reason?: string; cefrFit?: string };
  dayPlan: Array<{ order: number; focus: string }>;
  supplementedWeaknesses?: MemoSupplementedWeakness[];
}

export interface StudyMemo {
  _id: string;
  materials: Array<{
    refType: 'file' | 'resource';
    refId: string;
    title?: string;
  }>;
  note?: string;
  scope: 'date' | 'week';
  targetDate?: string;
  targetWeekNumber?: number;
  suitability?: { isSuitable: boolean; reason?: string; cefrFit?: string };
  totalDays: number;
  dayPlan: MemoDayPlanItem[];
  status: 'active' | 'completed';
}

export interface SavedResource {
  resourceId: string;
  title?: string;
  type?: string;
  addedAt?: string;
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
  todayProgress: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  weeklyProgress?: number;
  totalStudyTime: number;
  averageDaily: number;
}

export interface AIInsight {
  _id: string;
  title: string;
  description: string;
  actionText?: string;
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
  domainProficiency: DomainProficiencyItem[];
  partPerformance: PartPerformance[];
  learningPhases: LearningPhase[];
  dailyTasks: DailyTask[];
  dailyLesson?: DailyLessonData;
  weeklyPlan: WeeklyPlan[];
  learningStats: LearningStats;
  aiInsights: AIInsight[];
}

// Missed Sessions Check Types
export interface MissedSession {
  sessionId: string;
  scheduledDate: string;
  weekNumber: number;
  dayNumber: number;
  title?: string;
}

export interface CheckMissedSessionsResponse {
  message: string;
  data: {
    hasMissedSessions: boolean;
    missedCount: number;
    message: string;
    action: 'none' | 'mark_skipped' | 'regenerate_week';
    missedSessions: MissedSession[];
  };
}
