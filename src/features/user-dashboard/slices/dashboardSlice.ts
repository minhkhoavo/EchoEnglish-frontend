import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  DashboardData,
  DailyTask,
  DailyLessonData,
} from '../types/dashboard.types';

interface DashboardState {
  data: DashboardData | null;
  dailyLesson: DailyLessonData | null;
  dailyLessonLoading: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  data: null,
  dailyLesson: null,
  dailyLessonLoading: false,
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
        state.data.learningStats.completed = action.payload.todayCompleted;
        state.data.learningStats.weeklyCompleted =
          action.payload.weeklyCompleted;
      }
    },
    updateLessonItemStatus: (
      state,
      action: PayloadAction<{
        itemId: string;
        status: 'pending' | 'in-progress' | 'completed';
      }>
    ) => {
      if (state.dailyLesson) {
        const item = state.dailyLesson.planItems.find(
          (item) => item._id === action.payload.itemId
        );
        if (item) {
          item.status = action.payload.status;
        }
      }
    },
    updateResourceCompletion: (
      state,
      action: PayloadAction<{ resourceId: string; completed: boolean }>
    ) => {
      if (state.dailyLesson) {
        state.dailyLesson.planItems.forEach((item) => {
          const resource = item.resources.find(
            (r) => r._id === action.payload.resourceId
          );
          if (resource) {
            resource.completed = action.payload.completed;
          }
        });
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
  updateLessonItemStatus,
  updateResourceCompletion,
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
export const selectDailyLesson = (state: { dashboard: DashboardState }) =>
  state.dashboard.dailyLesson;
export const selectDailyLessonLoading = (state: {
  dashboard: DashboardState;
}) => state.dashboard.dailyLessonLoading;
