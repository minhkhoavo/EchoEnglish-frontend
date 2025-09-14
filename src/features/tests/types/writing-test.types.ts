import type {
  BaseTest,
  BaseQuestion,
  BasePart,
  BaseTestDetail,
  BaseTestCardProps,
  BaseDirection,
  BaseNarrator,
  TestsApiResponse,
  TestDetailApiResponse,
} from './shared.types';

// Writing-specific types extending base types
export interface WritingTest extends BaseTest {
  type: 'writing';
}

export type WritingTestCardProps = BaseTestCardProps<WritingTest>;

export interface WritingTestsResponse {
  tests: WritingTest[];
  total?: number;
  page?: number;
  limit?: number;
}

// API Response types
export type WritingTestsApiResponse = TestsApiResponse<WritingTest>;
export type WritingTestDetailApiResponse =
  TestDetailApiResponse<WritingTestDetail>;

// Writing-specific component types
export type WritingDirection = BaseDirection;
export type WritingNarrator = BaseNarrator;

// Writing-specific extensions
export interface WritingSuggestion {
  code: string;
  name: string;
  components: WritingSuggestionComponent[];
}

export interface WritingSuggestionComponent {
  code: string;
  name: string;
  sample: string;
  outline: string;
}

export interface WritingQuestion extends BaseQuestion {
  directions?: string[]; // Added for email questions
  suggestions?: WritingSuggestion[]; // Added for essay questions
}

export interface WritingPart extends BasePart {
  questions: WritingQuestion[];
}

export interface WritingTestDetail extends BaseTestDetail {
  type: 'writing';
  parts: WritingPart[];
}

// Extended types for UI components
export interface WritingTestWithAnswers extends WritingTestDetail {
  userAnswers?: Record<number, string | Record<string, string>>;
  completedAt?: string;
  score?: number;
}

export interface WritingQuestionProps {
  question: WritingQuestion;
  partTitle: string;
  questionIndex: number;
  totalQuestions: number;
  onAnswer?: (
    questionId: number,
    answer: string | Record<string, string>
  ) => void;
  userAnswer?: string | Record<string, string>;
  isReviewMode?: boolean;
  absoluteQuestionNumber?: number;
}

export interface WritingPartProps {
  part: WritingPart;
  onAnswer?: (
    questionId: number,
    answer: string | Record<string, string>
  ) => void;
  userAnswers?: Record<number, string | Record<string, string>>;
  isReviewMode?: boolean;
  baseQuestionNumber?: number;
}
