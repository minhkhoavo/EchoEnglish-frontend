import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem } from '../types/content.types';

export const addFilesToProcess = createAsyncThunk(
  'content/addFilesToProcess',
  async (newItems: ContentItem[]) => {
    return newItems;
  }
);

export const addUrlToProcess = createAsyncThunk(
  'content/addUrlToProcess',
  async (newItem: ContentItem) => {
    return newItem;
  }
);

interface ContentState {
  items: ContentItem[];
  loading: boolean;
  error: string | null;
  processingItems: string[];
}

const initialState: ContentState = {
  items: [],
  loading: false,
  error: null,
  processingItems: []
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.processingItems = state.processingItems.filter(id => id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    setItemStatus: (state, action: PayloadAction<{ id: string; status: ContentItem['status'] }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
      }
    },
    setLoadedFiles: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFilesToProcess.fulfilled, (state, action) => {
        state.items.push(...action.payload);
        state.processingItems.push(...action.payload.map(item => item.id));
      })
      .addCase(addUrlToProcess.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.processingItems.push(action.payload.id);
      });
  },
});

export const { removeItem, clearError, setItemStatus, setLoadedFiles, setLoading } = contentSlice.actions;

// Selectors
export const selectAllContent = (state: { content: ContentState }) => state.content.items;
export const selectReadyContent = (state: { content: ContentState }) => 
  state.content.items.filter(item => item.status === 'ready');
export const selectProcessingContent = (state: { content: ContentState }) => 
  state.content.items.filter(item => item.status === 'processing');
export const selectContentLoading = (state: { content: ContentState }) => state.content.loading;
export const selectContentError = (state: { content: ContentState }) => state.content.error;

export default contentSlice.reducer;
