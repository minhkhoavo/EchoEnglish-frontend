export const ReadingExerciseType = {
  DICTATION: 'dictation', // Nghe TTS và chép lại đoạn văn
  FILL_BLANKS: 'fill_blanks', // Điền từ còn thiếu trong đoạn văn
  COMPREHENSION: 'comprehension', // Câu hỏi đọc hiểu (AI-generated)
  SENTENCE_REORDER: 'sentence_reorder', // Sắp xếp lại thứ tự câu
  PARAGRAPH_SUMMARY: 'paragraph_summary', // Viết tóm tắt (AI-evaluated)
} as const;

export type ReadingExerciseType =
  (typeof ReadingExerciseType)[keyof typeof ReadingExerciseType];

// ============================================================================
// DIFFICULTY LEVELS
// ============================================================================

export const ReadingDifficulty = {
  BEGINNER: 'beginner', // A1-A2: Ít từ ẩn, gợi ý nhiều, câu hỏi đơn giản
  INTERMEDIATE: 'intermediate', // B1-B2: Trung bình
  ADVANCED: 'advanced', // C1-C2: Nhiều từ ẩn, ít gợi ý, câu hỏi phức tạp
} as const;

export type ReadingDifficulty =
  (typeof ReadingDifficulty)[keyof typeof ReadingDifficulty];

// ============================================================================
// TTS CONFIG
// ============================================================================

export interface TTSConfig {
  baseUrl: string;
  speed?: 'slow' | 'normal' | 'fast';
  voice?: string;
}

export const DEFAULT_TTS_CONFIG: TTSConfig = {
  baseUrl: 'https://classmate-vuive.vn/tts',
  speed: 'normal',
};

// ============================================================================
// PARAGRAPH/SEGMENT TYPE
// ============================================================================

export interface ArticleSegment {
  id: string;
  text: string;
  sentences: string[];
  wordCount: number;
  startIndex?: number; // Position in original article
}

// ============================================================================
// DICTATION EXERCISE
// ============================================================================

export interface DictationExercise {
  id: string;
  type: typeof ReadingExerciseType.DICTATION;
  difficulty: ReadingDifficulty;
  segment: ArticleSegment;
  mode: 'sentence' | 'paragraph' | 'phrase';
  hiddenWords: {
    index: number;
    word: string;
    hint?: string; // First letter or character count
  }[];
  ttsUrl: string;
  maxAttempts: number;
}

export interface DictationAnswer {
  exerciseId: string;
  userInput: string[];
  correctWords: string[];
  accuracy: number;
  mistakes: {
    index: number;
    expected: string;
    actual: string;
  }[];
  timeSpent: number;
}

// ============================================================================
// FILL IN THE BLANKS EXERCISE
// ============================================================================

export interface BlankItem {
  index: number;
  position: number; // Character position in text
  correctAnswer: string;
  acceptedAnswers?: string[]; // Alternative answers
  hint?: string;
  wordType?:
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'article'
    | 'other';
}

export interface FillBlanksExercise {
  id: string;
  type: typeof ReadingExerciseType.FILL_BLANKS;
  difficulty: ReadingDifficulty;
  segment: ArticleSegment;
  blankedText: string; // Text with _____ for blanks
  blanks: BlankItem[];
  wordBank?: string[]; // Optional word bank for easier mode
  showWordBank: boolean;
  ttsUrl?: string; // Optional TTS for hint
}

export interface FillBlanksAnswer {
  exerciseId: string;
  answers: {
    blankIndex: number;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  score: number;
  timeSpent: number;
}

// ============================================================================
// READING COMPREHENSION EXERCISE (AI-Generated)
// ============================================================================

export type ComprehensionQuestionType =
  | 'main_idea' // What is the main idea?
  | 'detail' // Specific detail from text
  | 'inference' // What can be inferred?
  | 'vocabulary' // Word meaning in context
  | 'author_purpose' // Why did the author write this?
  | 'cause_effect' // What caused X? What is the effect of Y?
  | 'sequence' // What happened first/next/last?
  | 'comparison'; // Compare/contrast

export interface ComprehensionQuestion {
  id: string;
  questionType: ComprehensionQuestionType;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  relatedTextPortion?: string; // Highlight relevant part of text
}

export interface ComprehensionExercise {
  id: string;
  type: typeof ReadingExerciseType.COMPREHENSION;
  difficulty: ReadingDifficulty;
  segment: ArticleSegment;
  questions: ComprehensionQuestion[];
  timeLimit?: number; // Optional time limit in seconds
  allowSkip: boolean;
}

export interface ComprehensionAnswer {
  exerciseId: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  totalScore: number;
  maxScore: number;
}

// ============================================================================
// SENTENCE REORDER EXERCISE
// ============================================================================

export interface SentenceReorderExercise {
  id: string;
  type: typeof ReadingExerciseType.SENTENCE_REORDER;
  difficulty: ReadingDifficulty;
  segment: ArticleSegment;
  shuffledSentences: {
    id: string;
    text: string;
    originalIndex: number;
  }[];
  correctOrder: string[]; // Array of sentence IDs in correct order
  hints?: string[]; // Transition words, connectors as hints
}

export interface SentenceReorderAnswer {
  exerciseId: string;
  userOrder: string[];
  isCorrect: boolean;
  correctPositions: number;
  totalPositions: number;
  timeSpent: number;
}

// ============================================================================
// PARAGRAPH SUMMARY EXERCISE (AI-Evaluated)
// ============================================================================

export interface ParagraphSummaryExercise {
  id: string;
  type: typeof ReadingExerciseType.PARAGRAPH_SUMMARY;
  difficulty: ReadingDifficulty;
  segment: ArticleSegment;
  maxWords: number;
  minWords: number;
  keyPoints: string[]; // Main points that should be included
  rubric: {
    mainIdea: number; // Points for capturing main idea
    keyDetails: number; // Points for including key details
    coherence: number; // Points for coherent writing
    grammar: number; // Points for grammar/spelling
  };
}

export interface ParagraphSummaryAnswer {
  exerciseId: string;
  userSummary: string;
  wordCount: number;
  aiEvaluation?: {
    score: number;
    maxScore: number;
    feedback: string;
    mainIdeaCaptured: boolean;
    missingPoints: string[];
    grammarIssues?: string[];
    suggestions: string[];
  };
  timeSpent: number;
}

// ============================================================================
// UNIFIED TYPES
// ============================================================================

export type ReadingExercise =
  | DictationExercise
  | FillBlanksExercise
  | ComprehensionExercise
  | SentenceReorderExercise
  | ParagraphSummaryExercise;

export type ReadingAnswer =
  | DictationAnswer
  | FillBlanksAnswer
  | ComprehensionAnswer
  | SentenceReorderAnswer
  | ParagraphSummaryAnswer;

// ============================================================================
// EXERCISE SESSION
// ============================================================================

export interface ReadingExerciseSession {
  id: string;
  resourceId: string;
  articleTitle: string;
  exercises: ReadingExercise[];
  answers: ReadingAnswer[];
  currentIndex: number;
  startedAt: string;
  completedAt?: string;
  totalScore: number;
  maxScore: number;
  progress: {
    completed: number;
    total: number;
    correctAnswers: number;
  };
}

export interface ReadingExerciseSettings {
  difficulty: ReadingDifficulty;
  exerciseTypes: ReadingExerciseType[];
  questionCount: number;
  enableTTS: boolean;
  enableHints: boolean;
  enableTimer: boolean;
  shuffleQuestions: boolean;
  autoAdvance: boolean; // Auto move to next question after answer
}

// ============================================================================
// AI EVALUATION REQUEST/RESPONSE
// ============================================================================

export interface AIEvaluationRequest {
  exerciseType: ReadingExerciseType;
  originalText: string;
  userAnswer: string;
  expectedAnswer?: string;
  rubric?: Record<string, number>;
  additionalContext?: string;
}

export interface AIEvaluationResponse {
  score: number;
  maxScore: number;
  feedback: string;
  detailedAnalysis?: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  isCorrect: boolean;
}

// ============================================================================
// EXERCISE GENERATION REQUEST
// ============================================================================

export interface GenerateExerciseRequest {
  articleContent: string;
  articleTitle?: string;
  exerciseType: ReadingExerciseType;
  difficulty: ReadingDifficulty;
  questionCount?: number;
  focusKeywords?: string[];
  segmentIndex?: number; // If generating for specific segment
}

export interface GenerateExerciseResponse {
  success: boolean;
  exercise: ReadingExercise;
  generatedAt: string;
}
