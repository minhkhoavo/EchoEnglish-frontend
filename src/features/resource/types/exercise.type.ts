import type { TranscriptSegment } from './resource.type';

// ============================================================================
// EXERCISE TYPES - Hệ thống bài tập phụ trợ từ YouTube Transcript
// ============================================================================

/**
 * Các loại bài tập hỗ trợ
 */
export const ExerciseType = {
  DICTATION: 'dictation', // Nghe chép - điền từ/câu
  FILL_BLANKS: 'fill_blanks', // Điền từ còn thiếu
  MULTIPLE_CHOICE: 'multiple_choice', // Trắc nghiệm
  SHADOWING: 'shadowing', // Nghe và nói theo
  SENTENCE_ORDER: 'sentence_order', // Sắp xếp từ thành câu
  VOCAB_MATCHING: 'vocab_matching', // Nối từ với nghĩa
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];

/**
 * Độ khó bài tập
 */
export const DifficultyLevel = {
  EASY: 'easy', // Dễ - ít từ ẩn, gợi ý nhiều
  MEDIUM: 'medium', // Trung bình
  HARD: 'hard', // Khó - nhiều từ ẩn, ít gợi ý
} as const;

export type DifficultyLevel =
  (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

/**
 * Trạng thái câu hỏi
 */
export const QuestionStatus = {
  UNANSWERED: 'unanswered',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',
} as const;

export type QuestionStatus =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base interface cho tất cả các câu hỏi
 */
export interface BaseQuestion {
  id: string;
  type: ExerciseType;
  segment: TranscriptSegment; // Transcript segment liên quan
  difficulty: DifficultyLevel;
}

/**
 * Base interface cho kết quả trả lời
 */
export interface BaseAnswer {
  questionId: string;
  status: QuestionStatus;
  timeSpent?: number; // Thời gian làm bài (ms)
  attempts?: number; // Số lần thử
}

// ============================================================================
// DICTATION - Nghe chép
// ============================================================================

export interface DictationQuestion extends BaseQuestion {
  type: typeof ExerciseType.DICTATION;
  mode: 'word' | 'phrase' | 'sentence'; // Chế độ: từ, cụm từ, cả câu
  hiddenIndices: number[]; // Vị trí các từ bị ẩn
  originalWords: string[]; // Mảng các từ gốc
  visibleText: string; // Text hiển thị với blank
  hints?: string[]; // Gợi ý (chữ cái đầu, số ký tự...)
}

export interface DictationAnswer extends BaseAnswer {
  userInput: string[];
  correctWords: string[];
  isCorrect: boolean[];
}

// ============================================================================
// FILL IN THE BLANKS - Điền từ
// ============================================================================

export interface FillBlanksQuestion extends BaseQuestion {
  type: typeof ExerciseType.FILL_BLANKS;
  blankedText: string; // Câu với ___
  blanks: {
    index: number;
    correctAnswer: string;
    position: number; // Vị trí trong câu
  }[];
  wordBank?: string[]; // Ngân hàng từ để chọn (optional)
}

export interface FillBlanksAnswer extends BaseAnswer {
  userAnswers: { blankIndex: number; answer: string }[];
  correctCount: number;
}

// ============================================================================
// MULTIPLE CHOICE - Trắc nghiệm
// ============================================================================

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: typeof ExerciseType.MULTIPLE_CHOICE;
  questionType: 'complete_sentence' | 'meaning' | 'grammar' | 'vocabulary';
  questionText: string; // Câu hỏi hoặc câu cần điền
  options: MultipleChoiceOption[];
  explanation?: string; // Giải thích đáp án
}

export interface MultipleChoiceAnswer extends BaseAnswer {
  selectedOptionId: string;
  isCorrect: boolean;
}

// ============================================================================
// SHADOWING - Nghe và nói theo
// ============================================================================

export interface ShadowingQuestion extends BaseQuestion {
  type: typeof ExerciseType.SHADOWING;
  text: string; // Câu cần đọc theo
  startTime: number; // Thời điểm bắt đầu trong video
  endTime: number; // Thời điểm kết thúc
  phonetics?: string; // Phiên âm IPA (optional)
  slowSpeed?: number; // Tốc độ chậm (0.5x, 0.75x)
}

export interface ShadowingAnswer extends BaseAnswer {
  audioBlob?: Blob; // Recording của user
  pronunciation?: {
    score: number;
    feedback: string;
  };
  completed: boolean;
}

// ============================================================================
// SENTENCE ORDERING - Sắp xếp câu
// ============================================================================

export interface SentenceOrderQuestion extends BaseQuestion {
  type: typeof ExerciseType.SENTENCE_ORDER;
  shuffledWords: { id: string; word: string }[];
  correctOrder: string[]; // Thứ tự đúng của IDs
  originalSentence: string;
}

export interface SentenceOrderAnswer extends BaseAnswer {
  userOrder: string[];
  isCorrect: boolean;
}

// ============================================================================
// VOCABULARY MATCHING - Nối từ
// ============================================================================

export interface VocabMatchItem {
  id: string;
  word: string;
  definition: string;
  example?: string;
}

export interface VocabMatchQuestion extends BaseQuestion {
  type: typeof ExerciseType.VOCAB_MATCHING;
  items: VocabMatchItem[];
  shuffledDefinitions: { id: string; definition: string }[];
}

export interface VocabMatchAnswer extends BaseAnswer {
  matches: { wordId: string; definitionId: string }[];
  correctCount: number;
}

// ============================================================================
// EXERCISE SESSION - Phiên luyện tập
// ============================================================================

export type Question =
  | DictationQuestion
  | FillBlanksQuestion
  | MultipleChoiceQuestion
  | ShadowingQuestion
  | SentenceOrderQuestion
  | VocabMatchQuestion;

export type Answer =
  | DictationAnswer
  | FillBlanksAnswer
  | MultipleChoiceAnswer
  | ShadowingAnswer
  | SentenceOrderAnswer
  | VocabMatchAnswer;

export interface ExerciseSession {
  id: string;
  resourceId: string; // ID của resource (video)
  exerciseType: ExerciseType;
  difficulty: DifficultyLevel;
  questions: Question[];
  answers: Answer[];
  startedAt: Date;
  completedAt?: Date;
  score: number; // Điểm tổng (0-100)
  totalQuestions: number;
  correctAnswers: number;
}

export interface ExerciseSettings {
  exerciseType: ExerciseType;
  difficulty: DifficultyLevel;
  questionCount: number; // Số câu hỏi
  enableTimer?: boolean; // Bật đếm thời gian
  enableHints?: boolean; // Bật gợi ý
  repeatIncorrect?: boolean; // Lặp lại câu sai
  autoPlayAudio?: boolean; // Tự động phát audio
  shuffleQuestions?: boolean; // Random thứ tự câu hỏi (mặc định false = theo video)
}

export interface ExerciseProgress {
  currentIndex: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeElapsed: number; // Tổng thời gian (ms)
}

// ============================================================================
// UI STATE
// ============================================================================

export interface ExercisePanelState {
  isOpen: boolean;
  activeExercise: ExerciseType | null;
  settings: ExerciseSettings;
  session: ExerciseSession | null;
  progress: ExerciseProgress;
}
