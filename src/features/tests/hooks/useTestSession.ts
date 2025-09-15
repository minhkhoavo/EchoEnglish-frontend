import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  saveAnswerByNumber,
  updateSession,
  restoreSession,
  startTest as startTestAction,
  endTest as endTestAction,
} from '../slices/testSlice';
import { testStorageService } from '../services/testStorageService';
import type {
  TOEICTest,
  TOEICTestDetail,
  TestPart,
  TestSession,
} from '../types/toeic-test.types';

export const useTestSession = () => {
  const dispatch = useAppDispatch();
  const currentSession = useAppSelector((state) => state.test.currentSession);
  const activeTest = useAppSelector((state) => state.test.activeTest);
  const user = useAppSelector((state) => state.auth.user);

  // Get user ID, fallback to 'guest' if not authenticated
  const userId = user?._id || 'guest';

  // Flag to prevent auto-save during restart
  const isRestarting = useRef(false);

  // Auto-save to IndexedDB whenever session changes
  useEffect(() => {
    const saveSessionToIndexedDB = async () => {
      if (currentSession && !isRestarting.current) {
        try {
          // Use the session's testMode, but validate it's correct
          const testMode = currentSession.testMode || 'full';

          // Validate that the session is still compatible
          if (!currentSession.testMode) {
            console.warn('⚠️ Session missing testMode, skipping auto-save');
            return;
          }

          console.log('💾 Auto-saving session:', {
            userId,
            testId: currentSession.testId,
            testMode,
            selectedParts: currentSession.selectedParts,
            partsKey: currentSession.partsKey,
            answers: Object.keys(currentSession.answers).length,
            sessionTestMode: currentSession.testMode,
          });

          await testStorageService.saveTestSession(
            userId,
            currentSession.testId,
            testMode,
            currentSession
          );

          console.log('✅ Auto-save completed successfully');
        } catch (error) {
          console.error('❌ Failed to save test session to IndexedDB:', error);
        }
      }
    };

    // Debounce saves to avoid too frequent writes
    const timeoutId = setTimeout(saveSessionToIndexedDB, 1000); // Reduce delay to 1 second
    return () => clearTimeout(timeoutId);
  }, [currentSession, userId]);

  // Initialize IndexedDB on first load
  useEffect(() => {
    // Debug log for user authentication
    console.log('🔐 Current user for test sessions:', {
      userId,
      isAuthenticated: !!user,
    });

    // Debug: Show all sessions in IndexedDB
    const debugSessions = async () => {
      await testStorageService.debugListAllSessions();
    };
    debugSessions();

    // Clean up old sessions periodically - DISABLED FOR TESTING
    // testStorageService.clearOldSessions().catch(console.error);
  }, [userId, user]);

  const startTest = useCallback(
    async (
      test: TOEICTest | TOEICTestDetail,
      timeLimit: number,
      testMode: 'full' | 'custom' = 'full',
      selectedParts?: string[]
    ): Promise<{
      hasExisting: boolean;
      existingSession?: TestSession;
      continueSession?: () => void;
      restartSession?: () => Promise<void>;
    }> => {
      try {
        console.log('🔍 Checking existing session:', {
          userId,
          testId: test.testId,
          testMode,
          selectedParts,
        });

        // Check if there's an existing session for this test configuration
        const existingSession = await testStorageService.getTestSession(
          userId,
          test.testId,
          testMode,
          Array.isArray(selectedParts)
            ? selectedParts
            : typeof selectedParts === 'string'
              ? (selectedParts as string).split('-')
              : []
        );

        if (existingSession) {
          // Return the existing session info for user decision
          return {
            hasExisting: true,
            existingSession,
            continueSession: () => {
              // Important: Reset Redux state completely before restoring
              dispatch(endTestAction());

              // Ensure the restored session has the correct testMode
              const sessionToRestore = {
                ...existingSession,
                testMode,
                selectedParts: Array.isArray(selectedParts)
                  ? selectedParts.join('-')
                  : typeof selectedParts === 'string'
                    ? (selectedParts as string)
                    : '',
              };

              dispatch(restoreSession(sessionToRestore));
              console.log('Restored existing test session:', test.testId, {
                testMode,
                answers: Object.keys(existingSession.answers).length,
                correctedTestMode: testMode,
              });
            },
            restartSession: async () => {
              // Set flag to prevent auto-save during restart
              isRestarting.current = true;

              // Important: Clear Redux state completely first
              dispatch(endTestAction());

              // Delete the existing session from IndexedDB
              try {
                await testStorageService.deleteTestSession(
                  userId,
                  test.testId,
                  testMode,
                  Array.isArray(selectedParts)
                    ? selectedParts
                    : typeof selectedParts === 'string'
                      ? (selectedParts as string).split('-')
                      : []
                );
                console.log(
                  '✅ Successfully deleted old session before restart'
                );
              } catch (error) {
                console.error('❌ Failed to delete old session:', error);
              }

              // Wait a bit to ensure IndexedDB transaction completes
              await new Promise((resolve) => setTimeout(resolve, 200));

              // Start completely fresh session
              dispatch(
                startTestAction({
                  test,
                  timeLimit,
                  testMode,
                  selectedParts: Array.isArray(selectedParts)
                    ? selectedParts
                    : typeof selectedParts === 'string'
                      ? (selectedParts as string).split('-')
                      : [],
                })
              );

              // Reset restart flag after a delay
              setTimeout(() => {
                isRestarting.current = false;
              }, 500);

              console.log('🔄 Restarted fresh test session:', test.testId, {
                testMode,
                clearedOldAnswers: true,
              });
            },
          };
        } else {
          // Start new test session
          dispatch(
            startTestAction({
              test,
              timeLimit,
              testMode,
              selectedParts: Array.isArray(selectedParts)
                ? selectedParts
                : typeof selectedParts === 'string'
                  ? (selectedParts as string).split('-')
                  : [],
            })
          );
          console.log('Started new test session:', test.testId);
          return { hasExisting: false };
        }
      } catch (error) {
        console.error('Failed to start/restore test session:', error);
        // Fallback to starting new session
        dispatch(
          startTestAction({
            test,
            timeLimit,
            testMode,
            selectedParts: Array.isArray(selectedParts)
              ? selectedParts
              : typeof selectedParts === 'string'
                ? (selectedParts as string).split('-')
                : [],
          })
        );
        return { hasExisting: false };
      }
    },
    [dispatch, userId]
  );

  // Force start a completely fresh session, bypassing any existing session checks
  const forceStartFresh = useCallback(
    async (
      test: TOEICTest | TOEICTestDetail,
      timeLimit: number,
      testMode: 'full' | 'custom' = 'full',
      selectedParts?: string[]
    ): Promise<void> => {
      try {
        console.log(
          '🆕 Force starting fresh session (bypass existing checks):',
          {
            userId,
            testId: test.testId,
            testMode,
            selectedParts,
          }
        );

        // First, ensure any existing session is deleted
        try {
          await testStorageService.deleteTestSession(
            userId,
            test.testId,
            testMode,
            Array.isArray(selectedParts)
              ? selectedParts
              : typeof selectedParts === 'string'
                ? (selectedParts as string).split('-')
                : []
          );
          console.log('🗑️ Ensured old session is deleted');
        } catch (error) {
          console.log(
            'ℹ️ No existing session to delete (or delete failed):',
            error
          );
        }

        // Clear Redux state completely first
        dispatch(endTestAction());

        // Wait a bit to ensure operations complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Start completely fresh session
        dispatch(
          startTestAction({
            test,
            timeLimit,
            testMode,
            selectedParts: Array.isArray(selectedParts)
              ? selectedParts
              : typeof selectedParts === 'string'
                ? (selectedParts as string).split('-')
                : [],
          })
        );

        console.log(
          '✅ Successfully started fresh session without existing data'
        );
      } catch (error) {
        console.error('❌ Failed to force start fresh session:', error);
        throw error;
      }
    },
    [dispatch, userId]
  );

  const saveAnswer = useCallback(
    (questionNumber: number, answer: string) => {
      dispatch(saveAnswerByNumber({ questionNumber, answer }));
    },
    [dispatch]
  );

  const getAnswer = useCallback(
    (questionNumber: number): string | null => {
      if (!currentSession) return null;
      return currentSession.answers[questionNumber] || null;
    },
    [currentSession]
  );

  const endTest = useCallback(async () => {
    if (currentSession) {
      try {
        // Clean up IndexedDB entry when test is completed
        await testStorageService.deleteTestSession(
          userId,
          currentSession.testId,
          currentSession.testMode || 'full',
          typeof currentSession.selectedParts === 'string'
            ? (currentSession.selectedParts as string).split('-')
            : []
        );
        console.log('🗑️ Cleaned up test session from IndexedDB');
      } catch (error) {
        console.error('❌ Failed to clean up IndexedDB:', error);
      }
    }

    dispatch(endTestAction());
  }, [currentSession, dispatch, userId]);

  const checkExistingSession = useCallback(
    async (
      testId: string,
      testMode: 'full' | 'custom' = 'full',
      selectedParts?: string[]
    ): Promise<TestSession | null> => {
      try {
        console.log('🔍 checkExistingSession called with:', {
          userId,
          testId,
          testMode,
          selectedParts,
        });

        const existingSession = await testStorageService.getTestSession(
          userId,
          testId,
          testMode,
          Array.isArray(selectedParts)
            ? selectedParts
            : typeof selectedParts === 'string'
              ? (selectedParts as string).split('-')
              : []
        );

        if (existingSession) {
          console.log('⚠️ FOUND EXISTING SESSION:', {
            sessionTestMode: existingSession.testMode,
            requestedTestMode: testMode,
            matches: existingSession.testMode === testMode,
            sessionUserId: existingSession.userId,
            sessionAnswers: Object.keys(existingSession.answers).length,
          });
        } else {
          console.log('✅ No existing session found for:', {
            userId,
            testId,
            testMode,
          });
        }

        return existingSession;
      } catch (error) {
        console.error('Failed to check existing session:', error);
        return null;
      }
    },
    [userId]
  );

  const updateCurrentSession = useCallback(
    (
      updates: Partial<{
        answers: Record<string, string>;
        timeRemaining: number;
      }>
    ) => {
      dispatch(updateSession(updates));
    },
    [dispatch]
  );

  // Get all answers as an array for easy iteration
  const getAllAnswers = useCallback((): Array<{
    questionNumber: number;
    answer: string;
  }> => {
    if (!currentSession) return [];

    return Object.entries(currentSession.answers).map(
      ([questionId, answer]) => ({
        questionNumber: parseInt(questionId),
        answer,
      })
    );
  }, [currentSession]);

  return {
    // State
    currentSession,
    activeTest,
    isActive: !!currentSession,

    // Actions
    startTest,
    forceStartFresh,
    endTest,
    saveAnswer,
    getAnswer,
    updateCurrentSession,
    getAllAnswers,
    checkExistingSession,

    // Debug functions
    debugListSessions: () => testStorageService.debugListAllSessions(),
    clearAllSessions: () => testStorageService.clearAllSessions(),
    testSaveSession: () => testStorageService.testSaveSession(), // Add test method
    forceDeleteSession: (
      testMode: 'full' | 'custom',
      selectedParts?: string[]
    ) =>
      testStorageService.deleteTestSession(
        userId,
        currentSession?.testId || '',
        testMode,
        selectedParts
      ),
    debugRawIndexedDB: () => {
      // Manual IndexedDB inspection
      const request = indexedDB.open('echo-english-db', 2); // Use correct version
      request.onsuccess = () => {
        const db = request.result;
        console.log('🔧 Manual IndexedDB check:');
        console.log('Object stores:', Array.from(db.objectStoreNames));
        const transaction = db.transaction(['test-sessions'], 'readonly');
        const store = transaction.objectStore('test-sessions');
        console.log('Store keyPath:', store.keyPath);

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          console.log('Raw data:', getAllRequest.result);
        };

        const getKeysRequest = store.getAllKeys();
        getKeysRequest.onsuccess = () => {
          console.log('All keys:', getKeysRequest.result);
        };

        db.close();
      };
    },

    // Utilities
    getProgress: () => {
      if (!currentSession || !activeTest) return 0;

      // Handle both TOEICTest and TOEICTestDetail types
      const testDetail = activeTest as TOEICTestDetail;
      const parts = testDetail.parts || [];
      const totalQuestions = parts.reduce((total: number, part: TestPart) => {
        const questionsCount = part.questions?.length || 0;
        const groupQuestionsCount =
          part.questionGroups?.reduce(
            (groupTotal: number, group) =>
              groupTotal + (group.questions?.length || 0),
            0
          ) || 0;
        return total + questionsCount + groupQuestionsCount;
      }, 0);

      const answeredQuestions = Object.keys(currentSession.answers).length;
      return totalQuestions > 0
        ? (answeredQuestions / totalQuestions) * 100
        : 0;
    },

    getTimeElapsed: () => {
      if (!currentSession || !currentSession.startTime) return 0;
      // Convert ISO date string to timestamp for calculation
      const startTime = new Date(currentSession.startTime).getTime();
      return Date.now() - startTime;
    },
  };
};
