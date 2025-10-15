// Roadmap API Types based on backend response
export interface RoadmapTargetWeakness {
  skillKey: string;
  skillName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  userAccuracy: number;
  _id: string;
}

export interface DailyFocus {
  dayNumber: number;
  dayOfWeek: number;
  focus: string;
  targetSkills: string[];
  suggestedDomains: string[];
  foundationWeight: number;
  estimatedMinutes: number;
  status: 'pending' | 'in-progress' | 'completed';
  scheduledDate: string | null;
  _id: string;
}

export interface WeeklyFocus {
  weekNumber: number;
  title: string;
  summary: string;
  focusSkills: string[];
  targetWeaknesses: RoadmapTargetWeakness[];
  recommendedDomains: string[];
  foundationWeight: number;
  expectedProgress: number;
  dailyFocuses: DailyFocus[];
  sessionsCompleted: number;
  totalSessions: number;
  status: 'upcoming' | 'in-progress' | 'completed';
  _id: string;
}

export interface PhaseSummary {
  weekRange: string;
  phaseTitle: string;
  targetScore: number;
  description: string;
  keyFocusAreas: string[];
  status: 'upcoming' | 'in-progress' | 'completed';
  _id: string;
}

export interface LearningStrategy {
  foundationFocus: number;
  domainFocus: number;
}

export interface RoadmapData {
  _id: string;
  userId: string;
  roadmapId: string;
  userPrompt: string;
  currentLevel: string;
  currentScore: number;
  targetScore: number;
  startDate: string;
  endDate: string;
  totalWeeks: number;
  studyTimePerDay: number;
  studyDaysPerWeek: number;
  learningStrategy: LearningStrategy;
  phaseSummary: PhaseSummary[];
  weeklyFocuses: WeeklyFocus[];
  currentWeek: number;
  overallProgress: number;
  sessionsCompleted: number;
  totalSessions: number;
  status: 'active' | 'completed' | 'paused';
  needsRecalibration: boolean;
  recalibrationCount: number;
  testResultId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface RoadmapApiResponse {
  message: string;
  data: RoadmapData;
}

// Types for UI transformation
export interface TransformedPhase {
  phase: number;
  weekRange: string;
  title: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  targetScore: number;
  color: string;
  bgColor: string;
  description: string;
  keyFocusAreas: string[];
}

export interface TransformedWeeklyLesson {
  weekNumber: number;
  title: string;
  summary: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  dailyLessons: string[];
  hasDetailedPlan: boolean;
}
