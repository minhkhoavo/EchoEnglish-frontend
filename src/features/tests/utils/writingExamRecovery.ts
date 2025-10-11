import type {
  WritingExamRecoveryInfo,
  WritingPartState,
} from '../slices/writingExamSlice';
import { writingStorageService } from '../services/writingStorageService';

export interface WritingRecoveryData {
  recoveryInfo: WritingExamRecoveryInfo;
  partStates: Record<number, WritingPartState>;
  currentPartIndex: number;
  currentQuestionIndex: number;
  globalTimeLeft: number;
  lastSavedAt: string;
}

// Helper to get current user ID (you may need to adjust this based on your auth system)
const getCurrentUserId = (): string => {
  // Try to get user from localStorage or auth state
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user._id || 'anonymous';
    }
  } catch (error) {
    console.error('Failed to get user ID:', error);
  }
  return 'anonymous';
};

export const saveWritingRecoveryData = async (
  data: WritingRecoveryData
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    await writingStorageService.saveWritingSession(userId, data);
    console.log('✅ Writing session saved to IndexedDB');
  } catch (error) {
    console.error('Failed to save writing exam recovery data:', error);
  }
};

export const loadWritingRecoveryData = async (
  testId: string
): Promise<WritingRecoveryData | null> => {
  try {
    const userId = getCurrentUserId();
    const data = await writingStorageService.getWritingSession(userId, testId);

    if (!data) return null;

    // Check if recovery data is too old (more than 24 hours)
    const lastSaved = new Date(data.lastSavedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      await clearWritingRecoveryData(testId);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load writing exam recovery data:', error);
    return null;
  }
};

export const clearWritingRecoveryData = async (
  testId: string
): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    await writingStorageService.deleteWritingSession(userId, testId);
    console.log('✅ Writing session cleared from IndexedDB');
  } catch (error) {
    console.error('Failed to clear writing exam recovery data:', error);
  }
};

export const calculateRemainingTime = (testEndTime: string): number => {
  const now = new Date();
  const endTime = new Date(testEndTime);
  const remainingMs = endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000)); // Return in seconds
};

export const isExamExpired = (testEndTime: string): boolean => {
  return calculateRemainingTime(testEndTime) === 0;
};
