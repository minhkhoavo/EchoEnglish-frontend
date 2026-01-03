import { useState, useCallback, useMemo } from 'react';
import type {
  ReadingExercise,
  ReadingAnswer,
  ReadingExerciseSession,
  ReadingExerciseSettings,
  ReadingDifficulty,
  ReadingExerciseType,
  ArticleSegment,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface UseReadingExerciseOptions {
  resourceId: string;
  articleTitle: string;
  articleContent: string;
  defaultSettings?: Partial<ReadingExerciseSettings>;
}

interface UseReadingExerciseReturn {
  // State
  session: ReadingExerciseSession | null;
  currentExercise: ReadingExercise | null;
  currentSegment: ArticleSegment | null;
  segments: ArticleSegment[];
  settings: ReadingExerciseSettings;
  isLoading: boolean;
  error: string | null;

  // Progress
  progress: {
    completed: number;
    total: number;
    score: number;
    maxScore: number;
    timeElapsed: number;
  };

  // Actions
  startSession: (exerciseType: ReadingExerciseType) => void;
  submitAnswer: (answer: ReadingAnswer) => void;
  skipExercise: () => void;
  endSession: () => ReadingExerciseSession;
  nextSegment: () => void;
  prevSegment: () => void;
  goToSegment: (index: number) => void;
  updateSettings: (settings: Partial<ReadingExerciseSettings>) => void;
  resetSession: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const splitIntoSegments = (content: string): ArticleSegment[] => {
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30);

  if (paragraphs.length === 0) {
    const sentences = content.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    const chunkSize = 3;
    const chunks: string[] = [];

    for (let i = 0; i < sentences.length; i += chunkSize) {
      chunks.push(sentences.slice(i, i + chunkSize).join(' '));
    }

    return chunks.map((text, idx) => ({
      id: `segment-${idx}`,
      text,
      sentences: text.split(/(?<=[.!?])\s+/).filter((s) => s.trim()),
      wordCount: text.split(/\s+/).filter((w) => w).length,
      startIndex: idx,
    }));
  }

  return paragraphs.map((text, idx) => ({
    id: `segment-${idx}`,
    text,
    sentences: text.split(/(?<=[.!?])\s+/).filter((s) => s.trim()),
    wordCount: text.split(/\s+/).filter((w) => w).length,
    startIndex: idx,
  }));
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ============================================================================
// HOOK
// ============================================================================

export const useReadingExercise = (
  options: UseReadingExerciseOptions
): UseReadingExerciseReturn => {
  const { resourceId, articleTitle, articleContent, defaultSettings } = options;

  // Memoize segments
  const segments = useMemo(
    () => splitIntoSegments(articleContent),
    [articleContent]
  );

  // Settings state
  const [settings, setSettings] = useState<ReadingExerciseSettings>({
    difficulty: 'intermediate',
    exerciseTypes: ['dictation', 'fill_blanks', 'comprehension'],
    questionCount: 5,
    enableTTS: true,
    enableHints: true,
    enableTimer: false,
    shuffleQuestions: false,
    autoAdvance: true,
    ...defaultSettings,
  });

  // Session state
  const [session, setSession] = useState<ReadingExerciseSession | null>(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Current segment
  const currentSegment = segments[currentSegmentIndex] || null;

  // Start a new session
  const startSession = useCallback(
    (exerciseType: ReadingExerciseType) => {
      const newSession: ReadingExerciseSession = {
        id: generateId(),
        resourceId,
        articleTitle,
        exercises: [],
        answers: [],
        currentIndex: 0,
        startedAt: new Date().toISOString(),
        totalScore: 0,
        maxScore: 0,
        progress: {
          completed: 0,
          total: segments.length,
          correctAnswers: 0,
        },
      };

      setSession(newSession);
      setStartTime(Date.now());
      setCurrentSegmentIndex(0);
      setError(null);
    },
    [resourceId, articleTitle, segments.length]
  );

  // Submit an answer
  const submitAnswer = useCallback(
    (answer: ReadingAnswer) => {
      if (!session) return;

      // Calculate score from answer
      let score = 0;
      let maxScore = 100;

      if ('score' in answer) {
        score = answer.score;
      } else if ('accuracy' in answer) {
        score = answer.accuracy;
      } else if ('totalScore' in answer && 'maxScore' in answer) {
        score = (answer.totalScore / answer.maxScore) * 100;
        maxScore = answer.maxScore;
      }

      setSession((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          answers: [...prev.answers, answer],
          totalScore: prev.totalScore + score,
          maxScore: prev.maxScore + maxScore,
          progress: {
            ...prev.progress,
            completed: prev.progress.completed + 1,
            correctAnswers:
              prev.progress.correctAnswers + (score >= 60 ? 1 : 0),
          },
        };
      });

      // Auto advance if enabled
      if (settings.autoAdvance && currentSegmentIndex < segments.length - 1) {
        setCurrentSegmentIndex((prev) => prev + 1);
      }
    },
    [session, settings.autoAdvance, currentSegmentIndex, segments.length]
  );

  // Skip current exercise
  const skipExercise = useCallback(() => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
    }
  }, [currentSegmentIndex, segments.length]);

  // End session and return results
  const endSession = useCallback((): ReadingExerciseSession => {
    if (!session) {
      throw new Error('No active session');
    }

    const finalSession: ReadingExerciseSession = {
      ...session,
      completedAt: new Date().toISOString(),
    };

    setSession(null);
    setStartTime(null);

    return finalSession;
  }, [session]);

  // Navigation
  const nextSegment = useCallback(() => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
    }
  }, [currentSegmentIndex, segments.length]);

  const prevSegment = useCallback(() => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex((prev) => prev - 1);
    }
  }, [currentSegmentIndex]);

  const goToSegment = useCallback(
    (index: number) => {
      if (index >= 0 && index < segments.length) {
        setCurrentSegmentIndex(index);
      }
    },
    [segments.length]
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<ReadingExerciseSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  // Reset session
  const resetSession = useCallback(() => {
    setSession(null);
    setCurrentSegmentIndex(0);
    setStartTime(null);
    setError(null);
  }, []);

  // Calculate progress
  const progress = useMemo(
    () => ({
      completed: session?.progress.completed || 0,
      total: segments.length,
      score: session?.totalScore || 0,
      maxScore: session?.maxScore || 0,
      timeElapsed: startTime ? Date.now() - startTime : 0,
    }),
    [session, segments.length, startTime]
  );

  return {
    // State
    session,
    currentExercise: null, // Would be populated based on exercise type
    currentSegment,
    segments,
    settings,
    isLoading,
    error,

    // Progress
    progress,

    // Actions
    startSession,
    submitAnswer,
    skipExercise,
    endSession,
    nextSegment,
    prevSegment,
    goToSegment,
    updateSettings,
    resetSession,
  };
};

export default useReadingExercise;
