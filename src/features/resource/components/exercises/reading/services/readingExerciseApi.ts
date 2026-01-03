import { api } from '@/core/api/api';
import type {
  ReadingExercise,
  ReadingExerciseType,
  ReadingDifficulty,
  AIEvaluationRequest,
  AIEvaluationResponse,
  ComprehensionQuestion,
  TrueFalseStatement,
  VocabularyContextItem,
  ArticleSegment,
} from '../types/reading-exercise.types';

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

interface GenerateQuestionsRequest {
  message: string; // Prompt for AI
}

interface GenerateQuestionsResponse {
  questions?: ComprehensionQuestion[];
  statements?: TrueFalseStatement[];
  vocabularyItems?: VocabularyContextItem[];
  blanks?: { index: number; word: string; hint: string }[];
  message?: string;
  raw?: boolean;
}

interface EvaluateAnswerRequest {
  message: string; // Structured prompt for evaluation
}

interface EvaluateAnswerResponse {
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
  strengths?: string[];
  improvements?: string[];
  suggestions?: string[];
  message?: string;
  raw?: boolean;
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

/**
 * Build prompt for generating comprehension questions
 */
export const buildComprehensionPrompt = (
  text: string,
  difficulty: ReadingDifficulty,
  questionCount: number = 5
): string => {
  const difficultyGuide = {
    beginner:
      'simple vocabulary, direct answers from text, focus on main idea and basic details',
    intermediate:
      'moderate vocabulary, some inference required, include vocabulary in context',
    advanced:
      'complex vocabulary, deep inference, author purpose, cause-effect relationships',
  };

  return `You are an expert English teacher. Generate ${questionCount} reading comprehension questions for the following text.

TEXT:
"""
${text}
"""

DIFFICULTY: ${difficulty} (${difficultyGuide[difficulty]})

Generate questions in JSON format with this structure:
{
  "questions": [
    {
      "id": "q1",
      "questionType": "main_idea|detail|inference|vocabulary|author_purpose|cause_effect",
      "question": "The question text",
      "options": [
        {"id": "a", "text": "Option A", "isCorrect": false},
        {"id": "b", "text": "Option B", "isCorrect": true},
        {"id": "c", "text": "Option C", "isCorrect": false},
        {"id": "d", "text": "Option D", "isCorrect": false}
      ],
      "explanation": "Explanation why the correct answer is correct",
      "relatedTextPortion": "The part of text this question refers to"
    }
  ]
}

Requirements:
- Mix question types appropriately for ${difficulty} level
- Each question must have exactly 4 options with 1 correct answer
- Explanations should be educational and helpful
- Options should be plausible but distinguishable
- Return ONLY the JSON object, no other text`;
};

/**
 * Build prompt for generating True/False statements
 */
export const buildTrueFalsePrompt = (
  text: string,
  difficulty: ReadingDifficulty,
  statementCount: number = 5
): string => {
  return `You are an expert English teacher. Generate ${statementCount} True/False statements for the following text.

TEXT:
"""
${text}
"""

DIFFICULTY: ${difficulty}

Generate statements in JSON format:
{
  "statements": [
    {
      "id": "s1",
      "statement": "The statement about the text",
      "isTrue": true|false,
      "explanation": "Why this statement is true/false",
      "relatedText": "Quote from text that supports or contradicts"
    }
  ]
}

Requirements:
- Mix true and false statements (roughly 50/50)
- For ${difficulty}: ${difficulty === 'beginner' ? 'use simple, directly stated facts' : difficulty === 'intermediate' ? 'include some inference' : 'require deep understanding and inference'}
- Explanations should reference the text
- Return ONLY the JSON object, no other text`;
};

/**
 * Build prompt for generating vocabulary context items
 */
export const buildVocabularyPrompt = (
  text: string,
  difficulty: ReadingDifficulty,
  wordCount: number = 5
): string => {
  return `You are an expert English teacher. Select ${wordCount} vocabulary words from the text and create context-based exercises.

TEXT:
"""
${text}
"""

DIFFICULTY: ${difficulty}

Generate in JSON format:
{
  "vocabularyItems": [
    {
      "word": "the vocabulary word",
      "sentence": "Original sentence containing the word",
      "contextClue": "Clue in context that helps understand meaning",
      "correctDefinition": "The meaning of the word in this context",
      "wrongDefinitions": ["Wrong definition 1", "Wrong definition 2", "Wrong definition 3"],
      "partOfSpeech": "noun|verb|adjective|adverb|etc"
    }
  ]
}

Requirements:
- Select words appropriate for ${difficulty} level
- Wrong definitions should be plausible but clearly wrong in context
- Context clues should help learners figure out the meaning
- Return ONLY the JSON object, no other text`;
};

/**
 * Build prompt for generating fill-in-the-blank exercise
 */
export const buildFillBlanksPrompt = (
  text: string,
  difficulty: ReadingDifficulty,
  blankCount: number = 5
): string => {
  const blankRatio = {
    beginner: 'function words (articles, prepositions)',
    intermediate: 'content words (nouns, verbs)',
    advanced: 'key vocabulary and idiomatic expressions',
  };

  return `You are an expert English teacher. Create a fill-in-the-blank exercise from this text.

TEXT:
"""
${text}
"""

DIFFICULTY: ${difficulty}
TARGET: Remove ${blankCount} words, focusing on ${blankRatio[difficulty]}

Generate in JSON format:
{
  "blanks": [
    {
      "index": 0,
      "word": "the removed word",
      "hint": "first letter or word length hint",
      "wordType": "noun|verb|adjective|adverb|preposition|article|other",
      "position": 45
    }
  ],
  "wordBank": ["word1", "word2", "..."] // shuffled list of correct answers plus 2-3 distractors
}

Requirements:
- Position is the character index where blank starts
- Hints should be appropriate for ${difficulty} level (more hints for beginner)
- Word bank includes all correct answers plus some distractors
- Return ONLY the JSON object, no other text`;
};

/**
 * Build prompt for evaluating summary
 */
export const buildSummaryEvaluationPrompt = (
  originalText: string,
  userSummary: string,
  keyPoints: string[],
  maxScore: number = 100
): string => {
  return `You are an expert English teacher evaluating a student's summary.

ORIGINAL TEXT:
"""
${originalText}
"""

KEY POINTS THAT SHOULD BE COVERED:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

STUDENT'S SUMMARY:
"""
${userSummary}
"""

Evaluate the summary and provide feedback in JSON format:
{
  "score": <number 0-${maxScore}>,
  "maxScore": ${maxScore},
  "feedback": "Overall feedback message",
  "isCorrect": true|false,
  "mainIdeaCaptured": true|false,
  "coveredKeyPoints": ["point1", "point2"],
  "missingPoints": ["missing1", "missing2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "grammarIssues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Scoring criteria:
- Main idea (30%): Does it capture the central theme?
- Key details (30%): How many key points are covered?
- Coherence (20%): Is it well-organized and clear?
- Language (20%): Grammar, vocabulary, spelling

Return ONLY the JSON object, no other text`;
};

/**
 * Build prompt for evaluating dictation
 */
export const buildDictationEvaluationPrompt = (
  originalText: string,
  userInput: string
): string => {
  return `You are an English teacher evaluating a dictation exercise.

ORIGINAL TEXT:
"""
${originalText}
"""

STUDENT'S TRANSCRIPTION:
"""
${userInput}
"""

Evaluate and provide feedback in JSON format:
{
  "score": <number 0-100>,
  "maxScore": 100,
  "accuracy": <percentage 0-100>,
  "feedback": "Overall feedback",
  "isCorrect": true|false,
  "mistakes": [
    {
      "expected": "correct word",
      "actual": "what student wrote",
      "type": "spelling|missing|extra|wrong_word"
    }
  ],
  "strengths": ["what they did well"],
  "suggestions": ["how to improve"]
}

Be lenient with minor punctuation differences.
Return ONLY the JSON object, no other text`;
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const readingExerciseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Generate exercise questions using AI
     * Calls /chat/message endpoint
     */
    generateExerciseQuestions: builder.mutation<
      GenerateQuestionsResponse,
      GenerateQuestionsRequest
    >({
      query: (body) => ({
        url: '/chat/message',
        method: 'POST',
        data: body,
      }),
    }),

    /**
     * Evaluate user answer using AI
     * Calls /chat/message endpoint
     */
    evaluateAnswer: builder.mutation<
      EvaluateAnswerResponse,
      EvaluateAnswerRequest
    >({
      query: (body) => ({
        url: '/chat/message',
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const {
  useGenerateExerciseQuestionsMutation,
  useEvaluateAnswerMutation,
} = readingExerciseApi;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate TTS URL for a text segment
 */
export const generateTTSUrl = (text: string): string => {
  return `https://classmate-vuive.vn/tts?text=${encodeURIComponent(text)}`;
};

/**
 * Split article into segments for exercises
 */
export const splitIntoSegments = (
  content: string,
  segmentSize: 'sentence' | 'paragraph' | 'chunk' = 'paragraph'
): ArticleSegment[] => {
  let segments: string[] = [];

  switch (segmentSize) {
    case 'sentence':
      // Split by sentence-ending punctuation
      segments = content
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);
      break;
    case 'paragraph':
      // Split by double newline or paragraph breaks
      segments = content.split(/\n\n+/).filter((s) => s.trim().length > 0);
      break;
    case 'chunk': {
      // Split into ~200 word chunks
      const words = content.split(/\s+/);
      const chunkSize = 200;
      for (let i = 0; i < words.length; i += chunkSize) {
        segments.push(words.slice(i, i + chunkSize).join(' '));
      }
      break;
    }
  }

  return segments.map((text, index) => ({
    id: `segment-${index}`,
    text: text.trim(),
    sentences: text.split(/(?<=[.!?])\s+/).filter((s) => s.trim()),
    wordCount: text.split(/\s+/).filter((w) => w).length,
    startIndex: index,
  }));
};

/**
 * Select words to blank out based on difficulty
 */
export const selectWordsToBlank = (
  text: string,
  difficulty: ReadingDifficulty,
  count: number
): { index: number; word: string; position: number }[] => {
  const words = text.split(/\s+/);
  const contentWords: { index: number; word: string; position: number }[] = [];
  const functionWords: { index: number; word: string; position: number }[] = [];

  // Common function words
  const FUNCTION_WORDS = new Set([
    'a',
    'an',
    'the',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'shall',
    'can',
    'to',
    'of',
    'in',
    'for',
    'on',
    'with',
    'at',
    'by',
    'from',
    'as',
    'and',
    'but',
    'or',
    'so',
    'yet',
    'not',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
  ]);

  let position = 0;
  words.forEach((word, index) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length >= 2) {
      const item = { index, word, position };
      if (FUNCTION_WORDS.has(cleanWord)) {
        functionWords.push(item);
      } else if (cleanWord.length >= 3) {
        contentWords.push(item);
      }
    }
    position += word.length + 1; // +1 for space
  });

  // Select based on difficulty
  let candidates: typeof contentWords = [];
  switch (difficulty) {
    case 'beginner':
      candidates =
        functionWords.length >= count
          ? functionWords
          : [...functionWords, ...contentWords];
      break;
    case 'intermediate':
      candidates = [...contentWords];
      break;
    case 'advanced':
      candidates = contentWords.filter((w) => w.word.length >= 5);
      if (candidates.length < count) {
        candidates = contentWords;
      }
      break;
  }

  // Shuffle and select
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/**
 * Create blanked text from original
 */
export const createBlankedText = (
  text: string,
  blanks: { position: number; word: string }[]
): string => {
  let result = text;
  // Sort blanks by position descending to avoid position shifts
  const sortedBlanks = [...blanks].sort((a, b) => b.position - a.position);

  sortedBlanks.forEach((blank) => {
    const before = result.substring(0, blank.position);
    const after = result.substring(blank.position + blank.word.length);
    const blankPlaceholder = '_'.repeat(Math.max(5, blank.word.length));
    result = before + blankPlaceholder + after;
  });

  return result;
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
