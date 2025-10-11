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

export interface BackendWritingResult {
  _id: string;
  userId: string;
  toeicWritingTestId: string;
  submissionTimestamp: string;
  status: 'completed' | 'scored' | 'partially_scored' | 'scoring_failed';
  totalScore: number;
  parts: BackendWritingPart[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendWritingPart {
  partIndex: number;
  partTitle: string;
  partDirection: string;
  questions: BackendWritingQuestion[];
}

export interface BackendWritingQuestion {
  questionNumber: number;
  promptText: string;
  promptImage?: string;
  userAnswer: string;
  questionMetadata: Record<string, unknown>;
  result?: {
    provider: string;
    scoredAt: string;
    original_text: string;
    upgraded_text?: string;
    upgrade_summary?: string; // Brief explanation of what was corrected
    overall_assessment: {
      criteria_scores: Record<string, number>;
      overallScore: number;
      summary: string;
      strengths: string[];
      areasForImprovement: string[];
    };
    related_vocabulary?: Array<{
      word_or_phrase: string;
      definition_or_usage: string;
    }>;
  };
}

interface ScoreInfo {
  score: number;
  maxScore: number;
  proficiencyLevel: ProficiencyLevel;
}

export interface WritingQuestionResult extends ScoreInfo {
  questionId: number;
  questionNumber: number;
  questionText: string;
  imageUrl?: string;
  userAnswer: string;
  wordCount: number;
  feedback: string[];
  strengths: string[];
  improvements: string[];
  upgradedText?: string; // Upgraded version with **highlighted** changes
  upgradeSummary?: string; // Brief explanation of what was corrected
  // Optional meta
  title?: string;
  timeSpent?: number;
}

export interface WritingPartResult extends ScoreInfo {
  partNumber: number;
  partName: string;
  description: string;
  questionsCount: number;
  strengths: string[];
  improvements: string[];
  icon: string; // Icon identifier
  questions: WritingQuestionResult[];
}

export interface WritingOverallResult {
  overallScore: number;
  maxOverallScore: number;
  proficiencyLevel: ProficiencyLevel;
  testDate: string;
  testDuration: number; // in minutes
  testTitle: string;
  completionRate: number; // percentage
  parts: WritingPartResult[];
}

export interface WritingResultStats {
  totalQuestions: number;
  answeredQuestions: number;
  totalWordCount: number;
}

export interface WritingResultPageProps {
  result: WritingOverallResult;
  stats?: WritingResultStats;
  onTakeAnotherTest?: () => void;
  onViewDetails?: (partNumber: number) => void;
}
