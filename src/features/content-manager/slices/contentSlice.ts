import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { ContentItem } from '../types/content.types';
import type { RootState } from '@/core/store/store';

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
  processingItems: [],
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.processingItems = state.processingItems.filter(
        (id) => id !== action.payload
      );
    },
    setItemStatus: (
      state,
      action: PayloadAction<{ id: string; status: ContentItem['status'] }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFilesToProcess.fulfilled, (state, action) => {
        state.items.push(...action.payload);
        state.processingItems.push(...action.payload.map((item) => item.id));
      })
      .addCase(addUrlToProcess.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.processingItems.push(action.payload.id);
      });
  },
});

export const { removeItem, setItemStatus, setLoadedFiles, setLoading } =
  contentSlice.actions;

export default contentSlice.reducer;
