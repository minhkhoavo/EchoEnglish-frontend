import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardData, DailyTask } from '../types/dashboard.types';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    updateTaskStatus: (
      state,
      action: PayloadAction<{ taskId: string; completed: boolean }>
    ) => {
      if (state.data) {
        const task = state.data.dailyTasks.find(
          (t) => t.id === action.payload.taskId
        );
        if (task) {
          task.completed = action.payload.completed;
        }
      }
    },
    updateLearningStreak: (state, action: PayloadAction<number>) => {
      if (state.data) {
        state.data.learningStats.currentStreak = action.payload;
      }
    },
    updateStudyTime: (
      state,
      action: PayloadAction<{ todayCompleted: number; weeklyCompleted: number }>
    ) => {
      if (state.data) {
        state.data.learningStats.todayProgress = action.payload.todayCompleted;
        state.data.learningStats.weeklyCompleted =
          action.payload.weeklyCompleted;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updateTaskStatus,
  updateLearningStreak,
  updateStudyTime,
  clearError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardData = (state: { dashboard: DashboardState }) =>
  state.dashboard.data;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.loading;
export const selectDashboardError = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;
export const selectDailyTasks = (state: { dashboard: DashboardState }) =>
  state.dashboard.data?.dailyTasks || [];
export const selectLearningStats = (state: { dashboard: DashboardState }) =>
  state.dashboard.data?.learningStats;
export const selectScoreData = (state: { dashboard: DashboardState }) =>
  state.dashboard.data?.scoreData;
export const selectAIInsights = (state: { dashboard: DashboardState }) =>
  state.dashboard.data?.aiInsights || [];
