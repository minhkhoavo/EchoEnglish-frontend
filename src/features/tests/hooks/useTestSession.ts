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
  TestSession,
} from '../types/toeic-test.types';

// Quản lý logic dữ liệu và trạng thái phiên làm bài kiểm tra TOEIC
// Đồng bộ dữ liệu giữa Redux store và IndexedDB (qua testStorageService).
export const useTestSession = () => {
  const dispatch = useAppDispatch();
  const currentSession = useAppSelector((state) => state.test.currentSession);
  const activeTest = useAppSelector((state) => state.test.activeTest);
  const user = useAppSelector((state) => state.auth.user);

  // Get user ID, fallback to 'guest' if not authenticated
  const userId = user?._id || 'guest';

  // Flag to prevent auto-save during restart
  // Khi bạn restart session, Redux sẽ clear currentSession, sau đó tạo session mới.
  // Trong khoảng thời gian này, không nên auto-save session null vào IndexedDB.
  const isRestarting = useRef(false);

  // "Auto-save" to IndexedDB whenever session changes
  useEffect(() => {
    const saveSessionToIndexedDB = async () => {
      if (currentSession && !isRestarting.current) {
        try {
          // Validate that the session is still compatible
          if (!currentSession.testMode) {
            return;
          }

          await testStorageService.saveTestSession(userId, currentSession);
        } catch (error) {
          console.error('❌ Failed to save test session to IndexedDB:', error);
        }
      }
    };

    // Debounce saves to avoid too frequent writes
    const timeoutId = setTimeout(saveSessionToIndexedDB, 1000); // Reduce delay to 1 second
    return () => clearTimeout(timeoutId);
  }, [currentSession, userId]);

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
        } catch (error) {
          // Ignore delete errors as session may not exist
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
    console.log('🔚 endTest called', { currentSession, userId });
    if (currentSession) {
      try {
        console.log('🗑️ Deleting IndexedDB session:', {
          userId,
          testId: currentSession.testId,
          testMode: currentSession.testMode || 'full',
          selectedParts: currentSession.selectedParts,
        });

        // Clean up IndexedDB entry when test is completed
        await testStorageService.deleteTestSession(
          userId,
          currentSession.testId,
          currentSession.testMode || 'full',
          typeof currentSession.selectedParts === 'string'
            ? currentSession.selectedParts === ''
              ? [] // Empty string should become empty array for 'full' partsKey
              : (currentSession.selectedParts as string).split('-')
            : []
        );
        console.log('✅ IndexedDB record deleted successfully');
      } catch (error) {
        console.error('❌ Failed to clean up IndexedDB:', error);
      }
    }

    console.log('🔄 Clearing Redux state');
    dispatch(endTestAction());
    console.log('✅ endTest completed');
  }, [currentSession, dispatch, userId]);

  const checkExistingSession = useCallback(
    async (
      testId: string,
      testMode: 'full' | 'custom' = 'full',
      selectedParts?: string[]
    ): Promise<TestSession | null> => {
      try {
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
        savedAt: string;
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
    // Convert answers object to sorted array
    // Object.entries chuyển { "1": "A", "2": "B" } thành [ ["1", "A"], ["2", "B"] ]
    // Sau đó map thành { questionNumber: 1, answer: "A" }
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
    isActive: !!currentSession, // !! cast to boolean

    // Actions
    startTest, // Bắt đầu một bài thi mới hoặc khôi phục từ phiên cũ trong IndexedDB
    forceStartFresh, // Luôn bắt đầu phiên thi mới mà không quan tâm phiên cũ trong IndexedDB
    endTest, // Kết thúc phiên thi, đồng thời xóa dữ liệu lưu trong IndexedDB và Redux.
    saveAnswer,
    getAnswer, // Lấy đáp án theo questionNumber
    updateCurrentSession,
    getAllAnswers,
    checkExistingSession, // Kiểm tra có phiên thi nào đang lưu trong IndexedDB không, nếu có thì trả về dữ liệu session đó
  };
};
