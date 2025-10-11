import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type WritingExamMode = 'practice' | 'exam';
export type WritingQuestionPhase = 'idle' | 'in-progress' | 'completed';

export interface WritingQuestionState {
  id: number;
  phase: WritingQuestionPhase;
  answer: string;
  wordCount: number;
  timeSpent: number; // in seconds
  lastModified?: string;
}

export interface WritingPartState {
  partNumber: number;
  timeLeft: number; // time remaining for this part in seconds
  isLocked: boolean; // whether user can return to this part
  questions: Record<number, WritingQuestionState>;
}

export interface WritingExamRecoveryInfo {
  testId: string;
  startedAt: string;
  examMode: WritingExamMode;
}

export interface WritingExamState {
  // Mode selection
  examMode: WritingExamMode;

  // Current exam session
  isExamActive: boolean;
  examCompleted: boolean;
  currentPartIndex: number;
  currentQuestionIndex: number;

  // Part states
  partStates: Record<number, WritingPartState>;

  // Recovery information
  recoveryInfo: WritingExamRecoveryInfo | null;

  // Timing
  globalTimeLeft: number; // Total exam time remaining in seconds (60 minutes = 3600 seconds)
}

const initialState: WritingExamState = {
  examMode: 'practice', // Default to practice mode
  isExamActive: false,
  examCompleted: false,
  currentPartIndex: 0,
  currentQuestionIndex: 0,
  partStates: {},
  recoveryInfo: null,
  globalTimeLeft: 60 * 60, // 60 minutes
};

const writingExamSlice = createSlice({
  name: 'writingExam',
  initialState,
  reducers: {
    // Mode selection
    setWritingExamMode: (state, action: PayloadAction<WritingExamMode>) => {
      state.examMode = action.payload;
    },

    // Exam session control
    startWritingExam: (
      state,
      action: PayloadAction<{
        testId: string;
        parts: Array<{
          partNumber: number;
          timeLimit: number; // in seconds
          questions: Array<{ id: number }>;
        }>;
      }>
    ) => {
      const { testId, parts } = action.payload;

      state.isExamActive = true;
      state.examCompleted = false;
      state.currentPartIndex = 0;
      state.currentQuestionIndex = 0;
      state.globalTimeLeft = 60 * 60; // 60 minutes

      // Initialize part states
      state.partStates = {};
      parts.forEach((part) => {
        const questions: Record<number, WritingQuestionState> = {};
        part.questions.forEach((q) => {
          questions[q.id] = {
            id: q.id,
            phase: 'idle',
            answer: '',
            wordCount: 0,
            timeSpent: 0,
          };
        });

        state.partStates[part.partNumber] = {
          partNumber: part.partNumber,
          timeLeft: part.timeLimit,
          isLocked: false,
          questions,
        };
      });

      // Set recovery info
      state.recoveryInfo = {
        testId,
        startedAt: new Date().toISOString(),
        examMode: state.examMode,
      };
    },

    endWritingExam: (state) => {
      state.isExamActive = false;
      state.examCompleted = true;
    },

    // Navigation
    goToWritingPart: (state, action: PayloadAction<number>) => {
      const partIndex = action.payload;
      // In exam mode, check if trying to go back to locked part
      if (state.examMode === 'exam') {
        const targetPartNumber = partIndex + 1;
        if (state.partStates[targetPartNumber]?.isLocked) {
          return; // Cannot navigate to locked part
        }
      }
      state.currentPartIndex = partIndex;
      state.currentQuestionIndex = 0;
    },

    goToWritingQuestion: (
      state,
      action: PayloadAction<{ partIndex: number; questionIndex: number }>
    ) => {
      const { partIndex, questionIndex } = action.payload;
      state.currentPartIndex = partIndex;
      state.currentQuestionIndex = questionIndex;
    },

    // Question state management
    updateWritingAnswer: (
      state,
      action: PayloadAction<{
        partNumber: number;
        questionId: number;
        answer: string;
        wordCount: number;
      }>
    ) => {
      const { partNumber, questionId, answer, wordCount } = action.payload;

      const part = state.partStates[partNumber];
      if (part && part.questions[questionId]) {
        part.questions[questionId].answer = answer;
        part.questions[questionId].wordCount = wordCount;
        part.questions[questionId].lastModified = new Date().toISOString();
        if (part.questions[questionId].phase === 'idle') {
          part.questions[questionId].phase = 'in-progress';
        }
      }
    },

    markWritingQuestionCompleted: (
      state,
      action: PayloadAction<{ partNumber: number; questionId: number }>
    ) => {
      const { partNumber, questionId } = action.payload;
      const part = state.partStates[partNumber];
      if (part && part.questions[questionId]) {
        part.questions[questionId].phase = 'completed';
      }
    },

    // Part management for exam mode
    lockWritingPart: (state, action: PayloadAction<number>) => {
      const partNumber = action.payload;
      if (state.partStates[partNumber]) {
        state.partStates[partNumber].isLocked = true;
      }
    },

    updatePartTime: (
      state,
      action: PayloadAction<{ partNumber: number; timeLeft: number }>
    ) => {
      const { partNumber, timeLeft } = action.payload;
      if (state.partStates[partNumber]) {
        state.partStates[partNumber].timeLeft = Math.max(0, timeLeft);
      }
    },

    // Recovery
    setWritingRecoveryInfo: (
      state,
      action: PayloadAction<WritingExamRecoveryInfo>
    ) => {
      state.recoveryInfo = action.payload;
    },

    clearWritingRecoveryInfo: (state) => {
      state.recoveryInfo = null;
    },

    restoreWritingFromRecovery: (
      state,
      action: PayloadAction<{
        partStates: Record<number, WritingPartState>;
        currentPartIndex: number;
        currentQuestionIndex: number;
        globalTimeLeft: number;
      }>
    ) => {
      const {
        partStates,
        currentPartIndex,
        currentQuestionIndex,
        globalTimeLeft,
      } = action.payload;
      state.partStates = partStates;
      state.currentPartIndex = currentPartIndex;
      state.currentQuestionIndex = currentQuestionIndex;
      state.globalTimeLeft = globalTimeLeft;
      state.isExamActive = true;
    },

    // Timing
    updateWritingGlobalTime: (state, action: PayloadAction<number>) => {
      state.globalTimeLeft = Math.max(0, action.payload);
      if (state.globalTimeLeft === 0) {
        state.isExamActive = false;
        state.examCompleted = true;
      }
    },

    // Reset
    resetWritingExam: (state) => {
      const mode = state.examMode;
      const newState = { ...initialState, examMode: mode };
      return newState;
    },
  },
});

export const {
  setWritingExamMode,
  startWritingExam,
  endWritingExam,
  goToWritingPart,
  goToWritingQuestion,
  updateWritingAnswer,
  markWritingQuestionCompleted,
  lockWritingPart,
  updatePartTime,
  setWritingRecoveryInfo,
  clearWritingRecoveryInfo,
  restoreWritingFromRecovery,
  updateWritingGlobalTime,
  resetWritingExam,
} = writingExamSlice.actions;

export default writingExamSlice.reducer;
