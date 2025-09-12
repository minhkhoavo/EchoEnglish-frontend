// Basic types for test list
export interface TOEICTest {
  testId: string;
  testTitle: string;
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

// API Response types
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

// Detailed test structure for /tests/:testId endpoint
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
  userAnswer?: string; // For storing user answers
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
  resultId: string;
  parts: TestPart[];
}

// Response type for getting test by part (contains only one part)
export interface TOEICTestPartDetail {
  _id: string;
  testId: string;
  testTitle: string;
  resultId: string;
  parts: [TestPart]; // Only one part in the array
}
