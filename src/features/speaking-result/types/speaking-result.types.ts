export type ProficiencyLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

interface ScoreInfo {
  score: number;
  maxScore: number;
  proficiencyLevel: ProficiencyLevel;
}

export interface SpeakingQuestionResult extends ScoreInfo {
  questionId: number;
  questionNumber: number;
  questionText: string;
  imageUrl?: string;
  recordingId: string;
  userResponseUrl?: string;
  feedback: string[];
  strengths: string[];
  improvements: string[];
  // Optional meta
  title?: string;
  time_to_think?: number;
  limit_time?: number;
}

export interface SpeakingPartResult extends ScoreInfo {
  partNumber: number;
  partName: string;
  description: string;
  questionsCount: number;
  strengths: string[];
  improvements: string[];
  icon: string; // Icon identifier
  questions: SpeakingQuestionResult[];
}

export interface SpeakingOverallResult {
  overallScore: number;
  maxOverallScore: number;
  proficiencyLevel: ProficiencyLevel;
  testDate: string;
  testDuration: number; // in minutes
  testTitle: string;
  completionRate: number; // percentage
  parts: SpeakingPartResult[];
}

export interface SpeakingResultStats {
  totalQuestions: number;
  answeredQuestions: number;
  averageResponseTime: number; // in seconds
  totalRecordingTime: number; // in seconds
}

export interface SpeakingResultPageProps {
  result: SpeakingOverallResult;
  stats?: SpeakingResultStats;
  onTakeAnotherTest?: () => void;
  onViewDetails?: (partNumber: number) => void;
}
