import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ExamMode = 'normal' | 'exam';
export type QuestionPhase =
  | 'idle'
  | 'preparation'
  | 'recording'
  | 'submitted'
  | 'completed';

export interface QuestionState {
  id: number;
  phase: QuestionPhase;
  preparationTimeLeft: number;
  recordingTimeLeft: number;
  submittedAt?: string;
  hasAudio: boolean;
}

export interface ExamRecoveryInfo {
  testId: string;
  testEndTime?: string; // ISO string from backend
  startedAt: string;
  totalDuration: number; // minutes
}

export interface SpeakingExamState {
  // Mode selection
  examMode: ExamMode;

  // Current exam session
  isExamActive: boolean;
  currentQuestionIndex: number;
  currentPartIndex: number;

  // Question states
  questionStates: Record<number, QuestionState>;

  // Recovery information
  recoveryInfo: ExamRecoveryInfo | null;

  // Exam flow control
  isAutoFlow: boolean; // Whether exam is running automatically
  examCompleted: boolean;

  // Audio feedback
  playPipSounds: boolean;

  // Timing
  globalTimeLeft: number; // Total exam time remaining in seconds
}

const initialState: SpeakingExamState = {
  // Try to restore persisted exam mode so a page refresh doesn't drop exam mode
  examMode: (() => {
    try {
      const m = localStorage.getItem('speaking_exam_mode');
      return m === 'exam' ? 'exam' : 'normal';
    } catch (e) {
      return 'normal';
    }
  })(),
  isExamActive: false,
  currentQuestionIndex: 0,
  currentPartIndex: 0,
  questionStates: {},
  recoveryInfo: null,
  isAutoFlow: false,
  examCompleted: false,
  playPipSounds: true,
  globalTimeLeft: 0,
};

const speakingExamSlice = createSlice({
  name: 'speakingExam',
  initialState,
  reducers: {
    // Mode selection
    setExamMode: (state, action: PayloadAction<ExamMode>) => {
      state.examMode = action.payload;
      try {
        localStorage.setItem('speaking_exam_mode', action.payload);
      } catch (e) {
        // ignore storage errors
      }
    },

    // Exam session control
    startExam: (
      state,
      action: PayloadAction<{
        testId: string;
        totalDuration: number;
        questions: Array<{
          id: number;
          preparationTime: number;
          recordingTime: number;
        }>;
      }>
    ) => {
      const { testId, totalDuration, questions } = action.payload;

      state.isExamActive = true;
      state.currentQuestionIndex = 0;
      state.currentPartIndex = 0;
      state.isAutoFlow = state.examMode === 'exam';
      state.examCompleted = false;
      state.globalTimeLeft = totalDuration * 60; // Convert to seconds

      // Initialize question states
      state.questionStates = {};
      questions.forEach((q) => {
        state.questionStates[q.id] = {
          id: q.id,
          phase: 'idle',
          preparationTimeLeft: q.preparationTime,
          recordingTimeLeft: q.recordingTime,
          hasAudio: false,
        };
      });

      // Set recovery info
      state.recoveryInfo = {
        testId,
        startedAt: new Date().toISOString(),
        totalDuration,
      };
    },

    endExam: (state) => {
      state.isExamActive = false;
      state.isAutoFlow = false;
      state.examCompleted = true;
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

    // Question state management
    updateQuestionPhase: (
      state,
      action: PayloadAction<{ questionId: number; phase: QuestionPhase }>
    ) => {
      const { questionId, phase } = action.payload;
      if (state.questionStates[questionId]) {
        state.questionStates[questionId].phase = phase;
      }
    },

    updateQuestionTime: (
      state,
      action: PayloadAction<{
        questionId: number;
        preparationTime?: number;
        recordingTime?: number;
      }>
    ) => {
      const { questionId, preparationTime, recordingTime } = action.payload;
      if (state.questionStates[questionId]) {
        if (preparationTime !== undefined) {
          state.questionStates[questionId].preparationTimeLeft =
            preparationTime;
        }
        if (recordingTime !== undefined) {
          state.questionStates[questionId].recordingTimeLeft = recordingTime;
        }
      }
    },

    markQuestionSubmitted: (
      state,
      action: PayloadAction<{ questionId: number; hasAudio: boolean }>
    ) => {
      const { questionId, hasAudio } = action.payload;
      if (state.questionStates[questionId]) {
        state.questionStates[questionId].phase = 'submitted';
        state.questionStates[questionId].submittedAt = new Date().toISOString();
        state.questionStates[questionId].hasAudio = hasAudio;
      }
    },

    // Recovery
    setRecoveryInfo: (state, action: PayloadAction<ExamRecoveryInfo>) => {
      state.recoveryInfo = action.payload;
    },

    clearRecoveryInfo: (state) => {
      state.recoveryInfo = null;
    },

    restoreFromRecovery: (
      state,
      action: PayloadAction<{
        questionStates: Record<number, QuestionState>;
        currentQuestionIndex: number;
        currentPartIndex: number;
        globalTimeLeft: number;
      }>
    ) => {
      const {
        questionStates,
        currentQuestionIndex,
        currentPartIndex,
        globalTimeLeft,
      } = action.payload;
      state.questionStates = questionStates;
      state.currentQuestionIndex = currentQuestionIndex;
      state.currentPartIndex = currentPartIndex;
      state.globalTimeLeft = globalTimeLeft;
      state.isExamActive = true;
      state.isAutoFlow = state.examMode === 'exam';
    },

    // Timing
    updateGlobalTime: (state, action: PayloadAction<number>) => {
      state.globalTimeLeft = Math.max(0, action.payload);
      if (state.globalTimeLeft === 0) {
        state.isExamActive = false;
        state.examCompleted = true;
      }
    },

    // Settings
    togglePipSounds: (state) => {
      state.playPipSounds = !state.playPipSounds;
    },

    // Reset
    resetExam: (state) => {
      // Keep persisted examMode
      const mode = state.examMode;
      try {
        localStorage.setItem('speaking_exam_mode', mode);
      } catch (e) {
        // ignore storage errors
      }
      return { ...initialState, examMode: mode };
    },

    initQuestionState: (
      state,
      action: PayloadAction<{
        questionId: number;
        preparationTime: number;
        recordingTime: number;
      }>
    ) => {
      const { questionId, preparationTime, recordingTime } = action.payload;
      if (!state.questionStates[questionId]) {
        state.questionStates[questionId] = {
          id: questionId,
          phase: 'idle',
          preparationTimeLeft: preparationTime,
          recordingTimeLeft: recordingTime,
          hasAudio: false,
        };
      }
    },
  },
});

export const {
  setExamMode,
  startExam,
  endExam,
  goToQuestion,
  nextQuestion,
  updateQuestionPhase,
  updateQuestionTime,
  markQuestionSubmitted,
  setRecoveryInfo,
  clearRecoveryInfo,
  restoreFromRecovery,
  updateGlobalTime,
  togglePipSounds,
  resetExam,
  initQuestionState,
} = speakingExamSlice.actions;

export default speakingExamSlice.reducer;
