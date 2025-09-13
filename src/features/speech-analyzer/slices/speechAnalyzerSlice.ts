import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface ErrorFilterSettings {
  mispronunciation: boolean;
  omission: boolean;
  insertion: boolean;
  unexpected_break: boolean;
  missing_break: boolean;
  monotone: boolean;
}

export interface SpeechAnalyzerState {
  errorFilter: ErrorFilterSettings;
  showErrorFilter: boolean;
}

const initialState: SpeechAnalyzerState = {
  errorFilter: {
    mispronunciation: true,
    omission: true,
    insertion: true,
    unexpected_break: true,
    missing_break: true,
    monotone: true,
  },
  showErrorFilter: false,
};

const speechAnalyzerSlice = createSlice({
  name: 'speechAnalyzer',
  initialState,
  reducers: {
    toggleErrorFilter: (
      state,
      action: PayloadAction<keyof ErrorFilterSettings>
    ) => {
      const errorType = action.payload;
      state.errorFilter[errorType] = !state.errorFilter[errorType];
    },
    setAllErrorFilters: (state, action: PayloadAction<boolean>) => {
      const value = action.payload;
      state.errorFilter = {
        mispronunciation: value,
        omission: value,
        insertion: value,
        unexpected_break: value,
        missing_break: value,
        monotone: value,
      };
    },
    setShowErrorFilter: (state, action: PayloadAction<boolean>) => {
      state.showErrorFilter = action.payload;
    },
    resetErrorFilters: (state) => {
      state.errorFilter = initialState.errorFilter;
      state.showErrorFilter = false;
    },
    setIntonationMode: (state) => {
      state.errorFilter = {
        mispronunciation: false,
        omission: false,
        insertion: false,
        unexpected_break: false,
        missing_break: false,
        monotone: false,
      };
      state.showErrorFilter = false;
    },
  },
});

export const {
  toggleErrorFilter,
  setAllErrorFilters,
  setShowErrorFilter,
  resetErrorFilters,
  setIntonationMode,
} = speechAnalyzerSlice.actions;

// Selectors
export const selectErrorFilter = (state: {
  speechAnalyzer: SpeechAnalyzerState;
}) => state.speechAnalyzer.errorFilter;
export const selectShowErrorFilter = (state: {
  speechAnalyzer: SpeechAnalyzerState;
}) => state.speechAnalyzer.showErrorFilter;
export const selectVisibleErrorTypes = (state: {
  speechAnalyzer: SpeechAnalyzerState;
}) =>
  new Set(
    Object.entries(state.speechAnalyzer.errorFilter)
      .filter(([, isVisible]) => isVisible)
      .map(([errorType]) => errorType)
  );

export default speechAnalyzerSlice.reducer;
