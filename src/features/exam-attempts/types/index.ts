export type ExamType = 'listening-reading' | 'speaking' | 'writing';

export type ExamStatus = 'completed' | 'in-progress' | 'not-started';

export interface ExamAttempt {
  id: string;
  type: ExamType;
  status: ExamStatus;
  title: string;
  description?: string;
  startedAt: string;
  duration?: number;

  score?: number;
  maxScore?: number;
  percentage?: number;
  sections?: {
    listening?: { score: number; maxScore: number };
    reading?: { score: number; maxScore: number };
  };
}

export interface ExamAttemptsState {
  listeningReading: ExamAttempt[];
  speaking: ExamAttempt[];
  writing: ExamAttempt[];
  loading: {
    listeningReading: boolean;
    speaking: boolean;
    writing: boolean;
  };
  error: {
    listeningReading: string | null;
    speaking: string | null;
    writing: string | null;
  };
  filters: {
    status: ExamStatus | 'all';
    sortBy: 'date' | 'score' | 'title';
    sortOrder: 'asc' | 'desc';
  };
}

// API Response types
export interface ListeningReadingResult {
  id: string;
  testTitle: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  duration: number;
  percentage: number;
  partsKey: string;
}

export interface ListeningReadingResponse {
  success: boolean;
  message: string;
  data: ListeningReadingResult[];
}

export interface SpeakingAttempt {
  _id: string;
  userId: string;
  toeicSpeakingTestId: string;
  testIdNumeric: number;
  submissionTimestamp: string;
  status: 'in_progress' | 'completed';
  createdAt: string;
  scoreOverall?: number;
  level?: string;
}

export interface SpeakingAttemptsResponse {
  message: string;
  data: SpeakingAttempt[];
}
