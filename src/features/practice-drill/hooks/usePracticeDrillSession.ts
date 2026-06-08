import { useState, useCallback } from 'react';

/**
 * Simple mock implementation of useTestSession for Practice Drill
 * This avoids the complexity of Redux test session management
 */
export const usePracticeDrillSession = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const saveAnswer = useCallback((questionNumber: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  }, []);

  const getAnswer = useCallback(
    (questionNumber: number): string | null => {
      return answers[questionNumber] || null;
    },
    [answers]
  );

  const clearAnswers = useCallback(() => {
    setAnswers({});
  }, []);

  return {
    answers,
    saveAnswer,
    getAnswer,
    clearAnswers,
  };
};
