// TOEIC test types (independent structure, different from speaking/writing)

// Basic TOEIC test interface
export interface TOEICTest {
  testId: string; // TOEIC uses string IDs
  testTitle: string;
  type: 'listening-reading';
  duration?: number;
  number_of_questions?: number;
  number_of_parts?: number;
}

export interface TestCardProps {
  test: TOEICTest;
}

export interface TOEICTestsResponse {
  tests: TOEICTest[];
  total?: number;
  page?: number;
  limit?: number;
}

// API Response types for TOEIC
export interface TOEICTestsApiResponse {
  data: TOEICTest[];
  message?: string;
}

export interface TOEICTestDetailApiResponse {
  data: TOEICTestDetail;
  message?: string;
}

export interface TOEICTestPartApiResponse {
  data: TOEICTestPartDetail;
  message?: string;
}

// TOEIC test specific structures
export interface TestOption {
  label: string;
  text: string;
}

export interface TestMedia {
  audioUrl: string | null;
  imageUrls: string[] | null;
  passageHtml: string | null;
  transcript: string | null;
  translation: string | null;
}

export interface TestQuestion {
  questionNumber: number;
  questionText: string | null;
  options: TestOption[];
  correctAnswer: string;
  explanation: string;
  media: TestMedia;
  userAnswer?: string;
}

export interface TestQuestionGroup {
  groupContext: TestMedia;
  questions: TestQuestion[];
}

export interface TestPart {
  partName: string;
  partId: string;
  questions?: TestQuestion[]; // For Parts 1, 2, 5
  questionGroups?: TestQuestionGroup[]; // For Parts 3, 4, 6, 7
}

export interface TOEICTestDetail {
  _id: string;
  testId: string;
  testTitle: string;
  type: 'listening-reading';
  parts: TestPart[];
}

// Response type for getting test by part (contains only one part)
export interface TOEICTestPartDetail {
  _id: string;
  testId: string;
  testTitle: string;
  type: 'listening-reading';
  parts: [TestPart]; // Only one part in the array
}
