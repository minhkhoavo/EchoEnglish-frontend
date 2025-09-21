import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ExamAttemptsState, ExamAttempt } from '../types';

const initialState: ExamAttemptsState = {
  listeningReading: [],
  speaking: [],
  writing: [],
  loading: {
    listeningReading: false,
    speaking: false,
    writing: false,
  },
  error: {
    listeningReading: null,
    speaking: null,
    writing: null,
  },
  filters: {
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  },
};

const examAttemptsSlice = createSlice({
  name: 'examAttempts',
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<Partial<typeof state.filters>>
    ) => {
      Object.assign(state.filters, action.payload);
    },
    setLoading: (
      state,
      action: PayloadAction<{
        type: keyof typeof state.loading;
        loading: boolean;
      }>
    ) => {
      const { type, loading } = action.payload;
      state.loading[type] = loading;
    },
    setError: (
      state,
      action: PayloadAction<{
        type: keyof typeof state.error;
        error: string | null;
      }>
    ) => {
      const { type, error } = action.payload;
      state.error[type] = error;
    },
    setSpeakingAttempts: (state, action: PayloadAction<ExamAttempt[]>) => {
      state.speaking = action.payload;
    },
    setListeningReadingAttempts: (
      state,
      action: PayloadAction<ExamAttempt[]>
    ) => {
      state.listeningReading = action.payload;
    },
    clearError: (state, action: PayloadAction<keyof typeof state.error>) => {
      state.error[action.payload] = null;
    },
  },
});

export const {
  setFilter,
  setLoading,
  setError,
  setSpeakingAttempts,
  setListeningReadingAttempts,
  clearError,
} = examAttemptsSlice.actions;
export default examAttemptsSlice.reducer;
