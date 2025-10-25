import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../types/auth.types';
import { api } from '@/core/api/api';

// Helper function to get user from storage
const getUserFromStorage = (): User | null => {
  const userStr =
    localStorage.getItem('user') || sessionStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  accessToken:
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken'),
  isAuthenticated: Boolean(
    localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
  ),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        rememberMe?: boolean;
      }>
    ) => {
      const { user, accessToken, rememberMe = false } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.error = null;

      // Store token and user info according to "Remember me"
      if (rememberMe) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        // Ensure removal from sessionStorage
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');
      } else {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('user', JSON.stringify(user));
        // Ensure removal from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        sessionStorage.setItem('user', JSON.stringify(action.payload));
      }
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      if (localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', action.payload);
      } else {
        sessionStorage.setItem('accessToken', action.payload);
      }
    },
  },
});

export const {
  setCredentials,
  setUser,
  logout,
  setLoading,
  setError,
  clearError,
  updateAccessToken,
} = authSlice.actions;

// Export action to reset API state (clear all cache)
export const resetApiState = api.util.resetApiState;

export default authSlice.reducer;
