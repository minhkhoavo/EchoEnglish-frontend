import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  TOEICTest as ListeningReadingTest,
  TestSession,
} from '../types/toeic-test.types';

interface TestState {
  activeTest: ListeningReadingTest | null; //  Thông tin về đề thi TOEIC hiện
  // tại mà người dùng đang làm. (Không thay đổi trong quá trình làm bài)
  currentSession: TestSession | null; // Trạng thái làm bài của người dùng với
  // đề đó như tiến trình, đáp án, thời gian, ... (Thay đổi liên tục khi người
  // dùng làm bài)
  isShowResults: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: TestState = {
  activeTest: null,
  currentSession: null,
  isShowResults: false,
  isLoading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Test session actions
    startTest: (
      state,
      action: PayloadAction<{
        test: ListeningReadingTest;
        timeLimit: number;
        testMode?: 'full' | 'custom';
        selectedParts?: string[];
      }>
    ) => {
      state.activeTest = action.payload.test;
      const now = Date.now();
      state.currentSession = {
        testId: action.payload.test._id,
        testTitle: action.payload.test.testTitle,
        startTime: new Date(now).toISOString(),
        timeLimit: new Date(now + action.payload.timeLimit).toISOString(),
        timeRemaining: action.payload.timeLimit, // ms
        answers: {},
        testMode: action.payload.testMode || 'full',
        selectedParts: action.payload.selectedParts
          ? action.payload.selectedParts.join('-')
          : '',
        partsKey: action.payload.selectedParts
          ? action.payload.selectedParts.slice().sort().join('-')
          : 'full',
      };
      state.isShowResults = false;
      state.error = null;
    },

    endTest: (state) => {
      state.currentSession = null;
      state.activeTest = null;
      state.isShowResults = false;
    },

    saveAnswerByNumber: (
      state,
      action: PayloadAction<{ questionNumber: number; answer: string }>
    ) => {
      if (state.currentSession) {
        state.currentSession.answers[action.payload.questionNumber] =
          action.payload.answer;
      }
    },

    restoreSession: (state, action: PayloadAction<TestSession>) => {
      state.currentSession = action.payload;
    },

    updateSession: (
      state,
      action: PayloadAction<
        Partial<{
          answers: Record<string, string>;
          timeRemaining: number;
          savedAt: string;
        }>
      >
    ) => {
      if (state.currentSession) {
        const update = { ...action.payload } as Partial<TestSession>;
        // timeRemaining là số ms, không cần chuyển đổi
        if (Array.isArray(update.selectedParts)) {
          update.selectedParts = update.selectedParts.join('-');
        }
        Object.assign(state.currentSession, update);
      }
    },

    // Results actions
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.isShowResults = action.payload;
    },

    // UI state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  startTest,
  setShowResults, // chưa dùng
  saveAnswerByNumber,
  restoreSession,
  updateSession,
  endTest,

  // UI actions
  setLoading,
  setError,
} = testSlice.actions;

export default testSlice.reducer;
