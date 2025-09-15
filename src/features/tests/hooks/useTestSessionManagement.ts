import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestSession } from '../hooks/useTestSession';
import type { TestSession, TOEICTest } from '../types/toeic-test.types';

export const useTestSessionManagement = (
  testId?: string,
  testData?: TOEICTest
) => {
  const navigate = useNavigate();
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingSession, setExistingSession] = useState<TestSession | null>(
    null
  );
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const { checkExistingSession, startTest, forceStartFresh } = useTestSession();

  const handleStartTest = async (
    isCustomMode: boolean,
    selectedParts: string[],
    customTime: string
  ) => {
    if (!testId) return;

    let targetUrl: string;
    let testMode: 'full' | 'custom';
    let partsToCheck: string[] | undefined;

    if (isCustomMode && selectedParts.length > 0) {
      // Custom mode with selected parts
      testMode = 'custom';
      partsToCheck = selectedParts;
      const partsParam = selectedParts.join(',');
      targetUrl = `/test-exam/${testId}?parts=${partsParam}&time=${customTime}&mode=custom`;
    } else {
      // Full test mode
      testMode = 'full';
      partsToCheck = undefined;
      targetUrl = `/test-exam/${testId}?mode=full&time=120`;
    }

    // Check for existing session with the specific test configuration
    try {
      console.log('TOEICTestDetail checking session:', {
        testId,
        testMode,
        partsToCheck,
        isCustomMode,
        selectedParts,
      });

      const existingSessionData = await checkExistingSession(
        testId,
        testMode,
        partsToCheck
      );

      if (existingSessionData) {
        // Show dialog asking user what to do
        setExistingSession(existingSessionData);
        setPendingNavigation(targetUrl);
        setShowContinueDialog(true);
      } else {
        // No existing session, create new session and navigate
        if (testData) {
          const timeLimit =
            (testMode === 'custom' ? parseInt(customTime || '30', 10) : 120) *
            60 *
            1000;
          await startTest(testData, timeLimit, testMode, partsToCheck);
        }
        navigate(targetUrl + '&start=true');
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      // If error occurs, proceed with navigation anyway
      navigate(targetUrl);
    }
  };

  const handleContinueSession = () => {
    setShowContinueDialog(false);
    if (pendingNavigation) {
      // Navigate without continue parameter, the TestExam will handle continue logic
      navigate(pendingNavigation + '&continue=true');
    }
  };

  const handleRestartSession = async (customTime: string) => {
    setShowContinueDialog(false);

    if (testData && existingSession) {
      try {
        // Get the test mode and selectedParts from the existing session
        const testMode = existingSession.testMode as 'full' | 'custom';
        const sessionParts =
          typeof existingSession.selectedParts === 'string'
            ? existingSession.selectedParts.split('-')
            : existingSession.selectedParts || [];

        // Calculate time limit (convert minutes to milliseconds)
        const timeInMinutes =
          testMode === 'custom' ? parseInt(customTime || '30', 10) : 120;
        const timeLimit = timeInMinutes * 60 * 1000;

        // Force start fresh session directly
        await forceStartFresh(testData, timeLimit, testMode, sessionParts);

        // Navigate without restart parameter
        if (pendingNavigation) {
          navigate(pendingNavigation);
        }
      } catch (error) {
        console.error('❌ Failed to restart session:', error);
        // Fallback: navigate anyway
        if (pendingNavigation) {
          navigate(pendingNavigation);
        }
      }
    }
  };

  const handleCancelSession = () => {
    setShowContinueDialog(false);
    setPendingNavigation(null);
    setExistingSession(null);
  };

  return {
    showContinueDialog,
    existingSession,
    handleStartTest,
    handleContinueSession,
    handleRestartSession,
    handleCancelSession,
  };
};
