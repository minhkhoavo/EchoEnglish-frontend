import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TOEICTest } from '../types/test.types';

export interface TestFilters {
  search: string;
  difficulty: string;
  category: string;
  completed: boolean;
  favorites: boolean;
}

export interface TestSession {
  testId: string;
  startTime: number;
  currentQuestionIndex: number;
  answers: Record<string, string>; // { questionId: answer }
  timeRemaining: number;
  isPaused: boolean;
}

export interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: number;
  sections: {
    listening: { score: number; total: number };
    reading: { score: number; total: number };
  };
}

interface TestState {
  // Test list state
  filters: TestFilters;
  viewMode: 'grid' | 'list';
  sortBy: 'title' | 'difficulty' | 'createdAt' | 'completedAt';
  sortDirection: 'asc' | 'desc';
  searchQuery: string;

  // Active test session
  activeTest: TOEICTest | null;
  currentSession: TestSession | null;

  // Test results
  lastResult: TestResult | null;
  showResults: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;
}

const initialState: TestState = {
  filters: {
    search: '',
    difficulty: '',
    category: '',
    completed: false,
    favorites: false,
  },
  viewMode: 'grid',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  searchQuery: '',

  activeTest: null,
  currentSession: null,

  lastResult: null,
  showResults: false,

  isLoading: false,
  error: null,
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    // Filter and search actions
    setFilters: (state, action: PayloadAction<Partial<TestFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filters.search = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: TestState['sortBy'];
        direction: 'asc' | 'desc';
      }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.direction;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },

    // Test session actions
    startTest: (
      state,
      action: PayloadAction<{ test: TOEICTest; timeLimit: number }>
    ) => {
      state.activeTest = action.payload.test;
      state.currentSession = {
        testId: action.payload.test.testId,
        startTime: Date.now(),
        currentQuestionIndex: 0,
        answers: {},
        timeRemaining: action.payload.timeLimit,
        isPaused: false,
      };
      state.showResults = false;
      state.error = null;
    },

    pauseTest: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = true;
      }
    },

    resumeTest: (state) => {
      if (state.currentSession) {
        state.currentSession.isPaused = false;
      }
    },

    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.timeRemaining = action.payload;
      }
    },

    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex = action.payload;
      }
    },

    nextQuestion: (state) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex += 1;
      }
    },

    previousQuestion: (state) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex = Math.max(
          0,
          state.currentSession.currentQuestionIndex - 1
        );
      }
    },

    saveAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answer: string }>
    ) => {
      if (state.currentSession) {
        state.currentSession.answers[action.payload.questionId] =
          action.payload.answer;
      }
    },

    submitTest: (state, action: PayloadAction<TestResult>) => {
      state.lastResult = action.payload;
      state.showResults = true;
      state.currentSession = null;
      state.activeTest = null;
    },

    endTest: (state) => {
      state.currentSession = null;
      state.activeTest = null;
      state.showResults = false;
    },

    // Results actions
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },

    clearResults: (state) => {
      state.lastResult = null;
      state.showResults = false;
    },

    // UI state actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  // Filter actions
  setFilters,
  setSearchQuery,
  setViewMode,
  setSorting,
  clearFilters,

  // Test session actions
  startTest,
  pauseTest,
  resumeTest,
  updateTimeRemaining,
  setCurrentQuestion,
  nextQuestion,
  previousQuestion,
  saveAnswer,
  submitTest,
  endTest,

  // Results actions
  setShowResults,
  clearResults,

  // UI actions
  setLoading,
  setError,
  clearError,
} = testSlice.actions;

export default testSlice.reducer;
