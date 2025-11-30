// Types for Admin TOEIC Test Management

export interface TestOption {
  label: string;
  text: string;
}

export interface TestMedia {
  audioUrl?: string | null;
  imageUrls?: string[] | null;
  passageHtml?: string | null;
  transcript?: string | null;
  translation?: string | null;
}

export interface ContentTags {
  difficulty?: string;
  style?: string;
  domain?: string[];
  genre?: string[];
  setting?: string[];
}

export interface SkillTags {
  part?: string;
  skills?: string[];
  distractorTypes?: string[];
  questionForm?: string;
  question_function?: string;
  responseStrategy?: string;
  skillCategory?: string;
  skillDetail?: string;
  grammarPoint?: string;
  vocabPoint?: string;
  tagType?: string;
  passageType?: string;
  requiresCrossReference?: boolean;
}

export interface TestQuestion {
  _id?: string;
  questionNumber: number;
  questionText?: string | null;
  options: TestOption[];
  correctAnswer: string;
  explanation?: string;
  media?: TestMedia;
  contentTags?: ContentTags;
  skillTags?: SkillTags;
  groupId?: string;
}

export interface TestQuestionGroup {
  _id?: string;
  groupContext: TestMedia;
  questions: TestQuestion[];
}

export interface TestPart {
  _id?: string;
  partName: string;
  questions?: TestQuestion[];
  questionGroups?: TestQuestionGroup[];
}

export interface AdminTest {
  _id: string;
  testTitle: string;
  type: 'listening-reading';
  duration: number;
  number_of_questions: number;
  number_of_parts: number;
  parts: TestPart[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTestListItem {
  _id: string;
  testTitle: string;
  type: 'listening-reading';
  duration: number;
  number_of_questions: number;
  number_of_parts: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminTestsResponse {
  tests: AdminTestListItem[];
  pagination: TestPagination;
}

export interface CreateTestRequest {
  testTitle: string;
  type?: 'listening-reading';
  duration?: number;
  number_of_questions?: number;
  number_of_parts?: number;
  parts?: TestPart[];
}

export interface UpdateTestRequest {
  testTitle?: string;
  duration?: number;
  number_of_questions?: number;
  number_of_parts?: number;
  parts?: TestPart[];
}

// API Response wrapper
export interface ApiResponse<T> {
  message: string;
  data: T;
}
