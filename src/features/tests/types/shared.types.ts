// Shared base types used across different test types

// Base test interface that all test types extend
export interface BaseTest {
  testId: string;
  testTitle: string;
  duration: number;
  number_of_questions: number;
  number_of_parts: number;
}

// Unified test type for Speaking/Writing API
export interface SpeakingWritingTest extends BaseTest {
  type: 'speaking' | 'writing';
}

// Base API Response structure
export interface BaseApiResponse<T> {
  data: T;
  message?: string;
}

// Base component interfaces
export interface BaseDirection {
  text: string;
}

export interface BaseNarrator {
  text?: string;
  audio?: string | null;
  image?: string | null;
  prepare_time?: number | null;
}

export interface BaseQuestion {
  id: number;
  title: string;
  time_to_think?: number | null;
  input: {
    type: string;
    rule?: Record<string, unknown> | null;
    'draft-rule'?: Record<string, unknown> | null;
  };
  limit_time?: number | null;
  offset: number;
  part_title: string;
  audio?: string | null;
  image?: string | null;
  sample_answer?: string | null;
  idea?: string | null;
}

export interface BasePart {
  id: number;
  title: string;
  offset: number;
  direction: BaseDirection;
  narrator?: BaseNarrator | null;
  questions: BaseQuestion[];
}

export interface BaseTestDetail extends BaseTest {
  parts: BasePart[];
}

// Base props for test components
export interface BaseTestCardProps<T extends BaseTest> {
  test: T;
}

export interface BaseQuestionProps<Q extends BaseQuestion> {
  question: Q;
  partTitle: string;
  questionIndex: number;
  totalQuestions: number;
  onAnswer?: (
    questionId: number,
    answer: string | Record<string, string>
  ) => void;
  userAnswer?: string;
  isReviewMode?: boolean;
  absoluteQuestionNumber?: number;
}

export interface BasePartProps<P extends BasePart> {
  part: P;
  onAnswer?: (questionId: number, answer: string) => void;
  userAnswers?: Record<number, string>;
  isReviewMode?: boolean;
  baseQuestionNumber?: number;
}

// Test session and results types

export interface TestSession {
  testId: string;
  testType: 'speaking' | 'writing' | 'listening-reading';
  startTime: number;
  currentQuestionIndex: number;
  answers: Record<string | number, string>;
  timeRemaining: number;
  isPaused: boolean;
  savedAt?: string; // ISO string timestamp for when session was last saved
}

export interface TestResult {
  testId: string;
  testType: 'speaking' | 'writing' | 'listening-reading';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: number;
}

// Common API response types
export type ApiResponse<T> = BaseApiResponse<T>;
export type TestsApiResponse<T extends BaseTest> = BaseApiResponse<T[]>;
export type TestDetailApiResponse<T extends BaseTestDetail> =
  BaseApiResponse<T>;
