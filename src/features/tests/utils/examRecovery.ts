const RECOVERY_STORAGE_KEY = 'speaking_exam_recovery';

export interface StoredRecoveryData {
  currentQuestionIndex: number;
  currentPartIndex: number;
  testAttemptId?: string;
  lastSavedAt: string;
}

export const saveRecoveryData = (data: StoredRecoveryData): void => {
  try {
    const dataWithTimestamp = {
      ...data,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      RECOVERY_STORAGE_KEY,
      JSON.stringify(dataWithTimestamp)
    );
  } catch (error) {
    console.warn('Failed to save recovery data:', error);
  }
};

export const loadRecoveryData = (): StoredRecoveryData | null => {
  try {
    const stored = localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as StoredRecoveryData;

    // Validate the data is recent (within 24 hours)
    const lastSaved = new Date(data.lastSavedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastSaved.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      clearRecoveryData();
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to load recovery data:', error);
    return null;
  }
};

export const clearRecoveryData = (): void => {
  try {
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear recovery data:', error);
  }
};

export const calculateRemainingTime = (testEndTime: string): number => {
  const endTime = new Date(testEndTime);
  const now = new Date();
  const remainingMs = endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(remainingMs / 1000)); // Return seconds
};

export const isExamExpired = (testEndTime: string): boolean => {
  return calculateRemainingTime(testEndTime) === 0;
};
