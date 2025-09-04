import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ActiveTab = 'dashboard' | 'content' | 'flashcards' | 'analytics';

interface UiState {
  activeTab: ActiveTab;
  isSidebarOpen: boolean;
}

const initialState: UiState = {
  activeTab: 'dashboard',
  isSidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<ActiveTab>) {
      state.activeTab = action.payload;
      state.isSidebarOpen = false;
    },
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setActiveTab, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
