// Result shapes returned by the generic AI endpoint (POST /admin/tests/ai).
// Each frontend prompt builder targets one of these shapes.

export interface AiGeneratedOption {
  label: string;
  text: string;
  distractorType?: string | null;
}

export interface AiGeneratedQuestion {
  questionText?: string | null;
  options: AiGeneratedOption[];
  correctAnswer: string;
  explanation?: string;
  /** Spoken script for listening parts (esp. Part 1 & 2 where options are blank). */
  transcript?: string | null;
}

export interface GenerateQuestionResult {
  questions: AiGeneratedQuestion[];
}

export interface GenerateGroupResult {
  groupContext: {
    passageHtml?: string | null;
    transcript?: string | null;
    translation?: string | null;
  };
  questions: AiGeneratedQuestion[];
}

export interface GenerateDistractorsResult {
  options: AiGeneratedOption[];
}

export interface GenerateExplanationResult {
  explanation: string;
}

export interface ImproveQuestionResult {
  questionText: string;
  options: AiGeneratedOption[];
  notes: string;
}

export interface ReviewIssue {
  type: 'spelling' | 'grammar' | 'style';
  original: string;
  suggestion: string;
  message: string;
}

/** Merged QA result: spelling/grammar + answer validation + difficulty. */
export interface ReviewResult {
  predictedAnswer: string | null;
  confidence: number;
  answerRationale: string;
  cefr: string;
  difficultyRationale: string;
  issues: ReviewIssue[];
}

export interface AutoTagResult {
  contentTags: Record<string, unknown>;
  skillTags: Record<string, unknown>;
}

export interface TranslateResult {
  translation: string;
}

export interface VocabWord {
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
}
export interface ExtractVocabResult {
  words: VocabWord[];
}

export interface FormatTranscriptResult {
  transcriptHtml: string;
}
