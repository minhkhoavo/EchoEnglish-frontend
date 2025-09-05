import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/slices/uiSlice.';
import contentReducer from '../../features/content-manager/slices/contentSlice';
import quizReducer from '../../features/quiz/slices/quizSlice';
import flashcardReducer from '../../features/flashcard/slices/flashcardSlice';
import testReducer from '../../features/test/slices/testSlice';
import authReducer from '../../features/auth/slices/authSlice';
import { api } from '../api/api';
import { quizApi } from '../../features/quiz/services/quizApi';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    content: contentReducer,
    quiz: quizReducer,
    flashcard: flashcardReducer,
    test: testReducer,
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    [quizApi.reducerPath]: quizApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, quizApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
