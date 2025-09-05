import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ActiveTab =
  | 'dashboard'
  | 'content'
  | 'flashcards'
  | 'analytics'
  | 'tests';

interface UiState {
  activeTab: ActiveTab;
  isSidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

const initialState: UiState = {
  activeTab: 'dashboard',
  isSidebarOpen: false,
  sidebarCollapsed: false,
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
    toggleSidebarCollapse(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const {
  setActiveTab,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setSidebarCollapsed,
} = uiSlice.actions;
export default uiSlice.reducer;
