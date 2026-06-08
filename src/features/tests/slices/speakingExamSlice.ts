import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ExamMode = 'normal' | 'exam';

export interface SpeakingExamState {
  // Mode selection
  examMode: ExamMode;

  // Current exam session (UI state only)
  isExamActive: boolean;
  currentQuestionIndex: number;
  currentPartIndex: number;

  // Audio feedback
  playPipSounds: boolean;

  // Test attempt ID from backend
  testAttemptId: string | null;
}

const initialState: SpeakingExamState = {
  examMode: 'normal',
  isExamActive: false,
  currentQuestionIndex: 0,
  currentPartIndex: 0,
  playPipSounds: true,
  testAttemptId: null,
};

const speakingExamSlice = createSlice({
  name: 'speakingExam',
  initialState,
  reducers: {
    // Mode selection
    setExamMode: (state, action: PayloadAction<ExamMode>) => {
      state.examMode = action.payload;
    },

    // Exam session control
    startExam: (
      state,
      action: PayloadAction<{
        testAttemptId: string;
      }>
    ) => {
      state.isExamActive = true;
      state.currentQuestionIndex = 0;
      state.currentPartIndex = 0;
      state.testAttemptId = action.payload.testAttemptId;
    },

    endExam: (state) => {
      state.isExamActive = false;
      state.testAttemptId = null;
    },

    // Question navigation
    goToQuestion: (
      state,
      action: PayloadAction<{ questionIndex: number; partIndex?: number }>
    ) => {
      state.currentQuestionIndex = action.payload.questionIndex;
      if (action.payload.partIndex !== undefined) {
        state.currentPartIndex = action.payload.partIndex;
      }
    },

    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },

    // Settings
    togglePipSounds: (state) => {
      state.playPipSounds = !state.playPipSounds;
    },

    // Reset
    resetExam: (state) => {
      const mode = state.examMode;
      return { ...initialState, examMode: mode };
    },
  },
});

export const {
  setExamMode,
  startExam,
  endExam,
  goToQuestion,
  nextQuestion,
  togglePipSounds,
  resetExam,
} = speakingExamSlice.actions;

export default speakingExamSlice.reducer;
