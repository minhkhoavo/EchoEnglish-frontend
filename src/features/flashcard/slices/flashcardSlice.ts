import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FlashcardFilters } from '../types/flashcard.types';

interface FlashcardState {
  filters: FlashcardFilters;
  viewMode: 'grid' | 'list';
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
}

const initialState: FlashcardState = {
  filters: {
    search: '',
    category: '',
    difficulty: '',
    tags: [],
    favorites: false,
    aiGenerated: false,
  },
  viewMode: 'grid',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  searchQuery: '',
};



const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FlashcardFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; direction: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDirection = action.payload.direction;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.searchQuery = '';
    },
  },
});

export const {
  setFilters,
  setSearchQuery,
  setViewMode,
  setSorting,
  clearFilters,
} = flashcardSlice.actions;

export default flashcardSlice.reducer;
