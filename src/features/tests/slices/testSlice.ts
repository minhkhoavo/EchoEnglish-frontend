import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  TOEICTest as ListeningReadingTest,
  TestSession,
} from '../types/toeic-test.types';

interface TestState {
  filters: {
    search: string;
    difficulty: string;
    category: string;
    completed: boolean;
    favorites: boolean;
  };
  viewMode: 'grid' | 'list';
  sortBy: 'title' | 'difficulty' | 'createdAt' | 'completedAt';
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  activeTest: ListeningReadingTest | null;
  currentSession: TestSession | null;
  lastResult: {
    testId: string;
    testType: 'listening-reading';
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    completedAt: number;
  } | null;
  showResults: boolean;
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
    setFilters: (
      state,
      action: PayloadAction<Partial<TestState['filters']>>
    ) => {
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
      action: PayloadAction<{
        test: ListeningReadingTest;
        timeLimit: number;
        testMode?: 'full' | 'custom';
        selectedParts?: string[];
      }>
    ) => {
      state.activeTest = action.payload.test;
      state.currentSession = {
        testId: action.payload.test.testId,
        testTitle: action.payload.test.testTitle,
        startTime: new Date(Date.now()).toISOString(),
        timeLimit: new Date(
          Date.now() + action.payload.timeLimit
        ).toISOString(),
        timeRemaining: new Date(
          Date.now() + action.payload.timeLimit
        ).toISOString(),
        answers: {},
        testMode: action.payload.testMode || 'full',
        selectedParts: action.payload.selectedParts
          ? action.payload.selectedParts.join('-')
          : '',
        partsKey: action.payload.selectedParts
          ? action.payload.selectedParts.slice().sort().join('-')
          : 'full',
      };
      state.showResults = false;
      state.error = null;
    },

    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.currentSession) {
        // Convert milliseconds to ISODate by adding to current time
        const remainingTime = new Date(
          Date.now() + action.payload
        ).toISOString();
        state.currentSession.timeRemaining = remainingTime;
      }
    },

    saveAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answer: string }>
    ) => {
      if (state.currentSession) {
        const questionNumber = parseInt(action.payload.questionId, 10);
        state.currentSession.answers[questionNumber] = action.payload.answer;
      }
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
        }>
      >
    ) => {
      if (state.currentSession) {
        // Convert timeRemaining to string if present
        const update = { ...action.payload } as Partial<TestSession>;
        if (typeof update.timeRemaining === 'number') {
          // Convert milliseconds to ISODate by adding to current time
          update.timeRemaining = new Date(
            Date.now() + update.timeRemaining
          ).toISOString();
        }
        // If selectedParts is present and is string[], convert to string
        if (Array.isArray(update.selectedParts)) {
          update.selectedParts = update.selectedParts.join('-');
        }
        Object.assign(state.currentSession, update);
      }
    },

    submitTest: (state, action: PayloadAction<TestState['lastResult']>) => {
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
  updateTimeRemaining,
  saveAnswer,
  saveAnswerByNumber,
  restoreSession,
  updateSession,
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
