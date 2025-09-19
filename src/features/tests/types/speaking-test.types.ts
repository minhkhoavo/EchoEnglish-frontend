import type {
  BaseTest,
  BaseQuestion,
  BasePart,
  BaseTestDetail,
  BaseTestCardProps,
  BaseQuestionProps,
  BasePartProps,
  BaseDirection,
  BaseNarrator,
  TestsApiResponse,
  TestDetailApiResponse,
} from './shared.types';

// Speaking-specific types extending base types
export interface SpeakingTest extends BaseTest {
  type: 'speaking';
}

export type SpeakingTestCardProps = BaseTestCardProps<SpeakingTest>;

export interface SpeakingTestsResponse {
  tests: SpeakingTest[];
  total?: number;
  page?: number;
  limit?: number;
}

// API Response types
export type SpeakingTestsApiResponse = TestsApiResponse<SpeakingTest>;
export type SpeakingTestDetailApiResponse =
  TestDetailApiResponse<SpeakingTestDetail>;

// Speaking-specific component types
export type SpeakingDirection = BaseDirection;
export type SpeakingNarrator = BaseNarrator;
export type SpeakingQuestion = BaseQuestion;

export interface SpeakingPart extends BasePart {
  questions: SpeakingQuestion[];
}

export interface SpeakingTestDetail extends BaseTestDetail {
  type: 'speaking';
  parts: SpeakingPart[];
  testEndTime?: string;
  isRecoverable?: boolean;
}

// Extended types for UI components
export interface SpeakingTestWithAnswers extends SpeakingTestDetail {
  userAnswers?: Record<number, string>;
  completedAt?: string;
  score?: number;
}

export interface SpeakingQuestionProps {
  question: SpeakingQuestion;
  partTitle: string;
  questionIndex: number;
  totalQuestions: number;
  onAnswer?: (questionId: number, answer: string) => void;
  userAnswer?: string;
  isReviewMode?: boolean;
  absoluteQuestionNumber?: number;
  // Attempt context for submitting recordings
  testAttemptId?: string;
  onSubmitRecording?: (params: {
    questionNumber: number;
    file: Blob | File;
  }) => Promise<void> | void;
  onBlobRecorded?: (questionId: number, blob: Blob) => void;
}

export interface SpeakingPartProps {
  part: SpeakingPart;
  onAnswer?: (questionId: number, answer: string) => void;
  userAnswers?: Record<number, string>;
  isReviewMode?: boolean;
  baseQuestionNumber?: number;
  testAttemptId?: string;
  onSubmitRecording?: (params: {
    questionNumber: number;
    file: Blob | File;
  }) => Promise<void> | void;
}
