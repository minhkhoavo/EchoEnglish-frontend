import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  Resource,
  ResourceType,
  VocabularyItem,
} from '../types/resource.type';

interface ResourceState {
  currentResource: Resource | null;
  searchQuery: string;
  activeTab: 'all' | ResourceType;
  currentPage: number;
  vocabulary: VocabularyItem[];
  selectedText: string;
  showSelectionMenu: boolean;
  selectionPosition: { x: number; y: number };
  currentTranslation: string;
  currentTime: number;
  isPlaying: boolean;
  // Admin-specific state
  suitableFilter: 'all' | 'true' | 'false';
  showAddVideo: boolean;
  videoUrl: string;
}

const initialState: ResourceState = {
  currentResource: null,
  searchQuery: '',
  activeTab: 'all',
  currentPage: 1,
  vocabulary: [],
  selectedText: '',
  showSelectionMenu: false,
  selectionPosition: { x: 0, y: 0 },
  currentTranslation: '',
  currentTime: 0,
  isPlaying: false,
  // Admin-specific state
  suitableFilter: 'all',
  showAddVideo: false,
  videoUrl: '',
};

const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    setCurrentResource: (state, action: PayloadAction<Resource | null>) => {
      state.currentResource = action.payload;
      // Reset vocabulary when switching resources
      if (action.payload) {
        state.vocabulary = [];
      }
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page when searching
    },

    setActiveTab: (state, action: PayloadAction<'all' | ResourceType>) => {
      state.activeTab = action.payload;
      state.currentPage = 1; // Reset to first page when changing tab
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    addVocabulary: (state, action: PayloadAction<VocabularyItem>) => {
      state.vocabulary.push(action.payload);
    },

    updateVocabulary: (
      state,
      action: PayloadAction<{ index: number; item: VocabularyItem }>
    ) => {
      const { index, item } = action.payload;
      if (index >= 0 && index < state.vocabulary.length) {
        state.vocabulary[index] = item;
      }
    },

    removeVocabulary: (state, action: PayloadAction<number>) => {
      state.vocabulary.splice(action.payload, 1);
    },

    setSelectedText: (state, action: PayloadAction<string>) => {
      state.selectedText = action.payload;
    },

    setShowSelectionMenu: (state, action: PayloadAction<boolean>) => {
      state.showSelectionMenu = action.payload;
    },

    setSelectionPosition: (
      state,
      action: PayloadAction<{ x: number; y: number }>
    ) => {
      state.selectionPosition = action.payload;
    },

    setCurrentTranslation: (state, action: PayloadAction<string>) => {
      state.currentTranslation = action.payload;
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },

    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    // Admin-specific actions
    setSuitableFilter: (
      state,
      action: PayloadAction<'all' | 'true' | 'false'>
    ) => {
      state.suitableFilter = action.payload;
      state.currentPage = 1; // Reset to first page when changing filter
    },

    setShowAddVideo: (state, action: PayloadAction<boolean>) => {
      state.showAddVideo = action.payload;
      if (!action.payload) {
        state.videoUrl = ''; // Clear video URL when hiding form
      }
    },

    setVideoUrl: (state, action: PayloadAction<string>) => {
      state.videoUrl = action.payload;
    },

    resetResourceState: () => initialState,
  },
});

export const {
  setCurrentResource,
  setSearchQuery,
  setActiveTab,
  setCurrentPage,
  addVocabulary,
  updateVocabulary,
  removeVocabulary,
  setSelectedText,
  setShowSelectionMenu,
  setSelectionPosition,
  setCurrentTranslation,
  setCurrentTime,
  setIsPlaying,
  setSuitableFilter,
  setShowAddVideo,
  setVideoUrl,
  resetResourceState,
} = resourceSlice.actions;

export default resourceSlice.reducer;
