// Components
export { DictationExercise } from './components/DictationExercise';
export { FillBlankExercise } from './components/FillBlankExercise';
export { ReadingComprehensionExercise } from './components/ReadingComprehensionExercise';
export { SentenceReorderExercise } from './components/SentenceReorderExercise';
export { ParagraphSummaryExercise } from './components/ParagraphSummaryExercise';
export { ArticleExerciseContainer } from './components/ArticleExerciseContainer';

// Hooks
export { useTTS, useExerciseTTS } from './hooks/useTTS';
export { useReadingExercise } from './hooks/useReadingExercise';

// Services
export {
  readingExerciseApi,
  useGenerateExerciseQuestionsMutation,
  useEvaluateAnswerMutation,
  buildComprehensionPrompt,
  buildTrueFalsePrompt,
  buildVocabularyPrompt,
  buildFillBlanksPrompt,
  buildSummaryEvaluationPrompt,
  buildDictationEvaluationPrompt,
  generateTTSUrl,
  splitIntoSegments,
  selectWordsToBlank,
  createBlankedText,
  shuffleArray,
} from './services/readingExerciseApi';

// Types
export type {
  // Exercise Types
  ReadingExerciseType,
  ReadingDifficulty,
  TTSConfig,
  ArticleSegment,

  // Dictation
  DictationExercise as DictationExerciseType,
  DictationAnswer,

  // Fill Blanks
  BlankItem,
  FillBlanksExercise as FillBlanksExerciseType,
  FillBlanksAnswer,

  // Reading Comprehension
  ComprehensionQuestionType,
  ComprehensionQuestion,
  ComprehensionExercise,
  ComprehensionAnswer,

  // Sentence Reorder
  SentenceReorderExercise as SentenceReorderExerciseType,
  SentenceReorderAnswer,

  // Vocabulary Context
  VocabularyContextItem,
  VocabularyContextExercise,
  VocabularyContextAnswer,

  // Paragraph Summary
  ParagraphSummaryExercise as ParagraphSummaryExerciseType,
  ParagraphSummaryAnswer,

  // True/False
  TrueFalseStatement,
  TrueFalseExercise,
  TrueFalseAnswer,

  // Word Definition
  WordDefinitionItem,
  WordDefinitionExercise,
  WordDefinitionAnswer,

  // Unified
  ReadingExercise,
  ReadingAnswer,
  ReadingExerciseSession,
  ReadingExerciseSettings,

  // AI
  AIEvaluationRequest,
  AIEvaluationResponse,
  GenerateExerciseRequest,
  GenerateExerciseResponse,
} from './types/reading-exercise.types';

export {
  ReadingExerciseType as ReadingExerciseTypeEnum,
  ReadingDifficulty as ReadingDifficultyEnum,
  DEFAULT_TTS_CONFIG,
} from './types/reading-exercise.types';
