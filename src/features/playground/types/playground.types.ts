// Compile-time mirrors of the backend generator inputs. These intentionally
// match the server interfaces (GenerateRoadmapInput, DailyPlanContext, and the
// playground pipeline bodies) so the simulator stays in 100% signature parity.

export type GeneratorKind = 'roadmap' | 'dailySession';
export type Fidelity = 'ai' | 'pipeline';
export type DataMode = 'real' | 'mock' | 'hybrid';

export interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export interface WeaknessData {
  skillKey: string;
  skillName: string;
  severity: string;
  category: string;
  accuracy?: number;
  userAccuracy?: number;
}

// ---- Roadmap: pure AI input (mirror of GenerateRoadmapInput) ----
export interface RoadmapAiInput {
  userId: string;
  userPrompt: string;
  targetScore: number;
  studyTimePerDay: number;
  studyDaysPerWeek: number;
  userPreferences?: {
    primaryGoal?: string;
    currentLevel?: string;
    preferredStudyTime?: string;
    contentInterests?: string[];
    studyDaysOfWeek?: number[];
  };
  testAnalysis?: {
    score: number;
    weaknesses: unknown[];
    strengths: string[];
    summary: string;
    domainsPerformance?: unknown[];
  };
  providedWeaknesses?: unknown[];
  todayDayOfWeek?: number;
}

// ---- Roadmap: pipeline input (mirror of RoadmapService.generateRoadmap) ----
export interface RoadmapPipelineInput {
  userId?: string;
  userPrompt?: string;
  targetScore: number;
  studyTimePerDay?: number;
  studyDaysPerWeek?: number;
  testResultId?: string;
  weaknesses?: WeaknessData[];
  userPreferences?: RoadmapAiInput['userPreferences'];
  testAnalysis?: RoadmapAiInput['testAnalysis'];
  todayDayOfWeek?: number;
}

export interface RoadmapWeeklyFocus {
  weekNumber: number;
  title: string;
  summary: string;
  focusSkills: string[];
  targetWeaknesses: Array<{
    skillKey: string;
    skillName: string;
    severity: string;
    category?: string;
    userAccuracy?: number;
  }>;
  recommendedDomains: string[];
  foundationWeight?: number;
  expectedProgress?: number;
  status?: string;
  // Mistake stack carried on the week — fed to the daily generator as
  // mistakesToReview in the pipeline path.
  mistakes?: Array<{
    questionId: string;
    questionText: string;
    contentTags?: string[];
    skillTag?: string;
    partNumber?: number;
    difficulty?: string;
    mistakeCount: number;
  }>;
  dailyFocuses?: Array<{
    dayNumber?: number;
    dayOfWeek: number;
    focus: string;
    targetSkills: string[];
    suggestedDomains: string[];
    estimatedMinutes: number;
    status?: string;
  }>;
}

export interface RoadmapOutput {
  currentLevel: string;
  learningStrategy?: { foundationFocus: number; domainFocus: number };
  totalWeeks: number;
  phaseSummary?: Array<{
    weekRange?: string;
    phaseTitle?: string;
    targetScore?: number;
    description?: string;
    keyFocusAreas?: string[];
    status?: string;
  }>;
  weeklyFocuses: RoadmapWeeklyFocus[];
}

// ---- Daily session: pure AI input (mirror of DailyPlanContext) ----
export interface DailyPlanContext {
  dailyFocus: {
    focus: string;
    targetSkills: string[];
    suggestedDomains: string[];
    estimatedMinutes: number;
  };
  weekFocus: {
    weekNumber: number;
    title: string;
    summary: string;
    focusSkills: string[];
    targetWeaknesses: Array<{
      skillKey: string;
      skillName: string;
      severity: string;
      category: string;
      userAccuracy?: number;
    }>;
    recommendedDomains: string[];
  };
  competencyProfile?: {
    currentLevel: string;
    lowestSkills?: Array<{
      skill: string;
      currentAccuracy: number;
      proficiency: string;
    }>;
  };
  userPreferences?: {
    preferredStudyTime?: string;
    contentInterests?: string[];
  };
  mistakesToReview?: Array<{
    questionId: string;
    questionText: string;
    contentTags?: string[];
    skillTag?: string;
    partNumber?: number;
    difficulty?: string;
    mistakeCount: number;
  }>;
  availableResources?: Array<{
    type: string;
    title: string;
    description: string;
    url?: string;
    domain?: string;
    topics?: string[];
  }>;
  missedSessions?: Array<{
    focus: string;
    targetSkills: string[];
    suggestedDomains: string[];
  }>;
  userDirectives?: {
    focus: string;
    note?: string;
    materials: Array<{ title: string; type: string; domain?: string }>;
  };
}

export interface DailyPlanOutput {
  activities: Array<Record<string, unknown>>;
  reasoning: string;
}

// ---- Daily session: pipeline input (mirror of buildSessionPlan wiring) ----
export interface DailySessionPipelineInput {
  roadmap: {
    _id?: string;
    userId?: string;
    testResultId?: string;
    roadmapId?: string;
    currentLevel?: string;
    studyTimePerDay?: number;
    weeklyFocuses: RoadmapWeeklyFocus[];
    studyMemos?: unknown[];
  };
  targetWeekNumber: number;
  targetDayOfWeek?: number;
  isBlocked?: boolean;
  userId?: string;
}
