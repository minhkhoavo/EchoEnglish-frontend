/**
 * Wrapper for useTestSession that provides compatibility with Practice Drill mode
 * This allows Part components to work seamlessly in both regular test mode and practice drill mode
 */

import { useContext } from 'react';
import { useTestSession as useOriginalTestSession } from './useTestSession';
import { PracticeDrillContext } from '../../practice-drill/contexts/PracticeDrillContext';

export const useTestSessionWrapper = (isReviewMode?: boolean) => {
  // Check if we're in Practice Drill context
  const practiceDrillContext = useContext(PracticeDrillContext);

  // Always call the original hook (React rule)
  const originalSession = useOriginalTestSession(isReviewMode);

  // If in Practice Drill context, override with mock functions
  if (practiceDrillContext) {
    return {
      ...originalSession,
      saveAnswer: practiceDrillContext.saveAnswer,
      getAnswer: practiceDrillContext.getAnswer,
    };
  }

  // Otherwise, return the original hook result
  return originalSession;
};

// Re-export with the same name for compatibility
export { useTestSessionWrapper as useTestSession };
