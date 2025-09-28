import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../store/slices/uiSlice.';
import contentReducer from '../../features/content-manager/slices/contentSlice';
import quizReducer from '../../features/quiz/slices/quizSlice';
import flashcardReducer from '../../features/flashcard/slices/flashcardSlice';
import testReducer from '../../features/tests/slices/testSlice';
import speakingExamReducer from '../../features/tests/slices/speakingExamSlice';
import authReducer from '../../features/auth/slices/authSlice';
import speechAnalyzerReducer from '../../features/speech-analyzer/slices/speechAnalyzerSlice';
import examAttemptsReducer from '../../features/exam-attempts/slices/examAttemptsSlice';
import notificationReducer from '../../features/notification/slices/notificationSlice';
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
    speakingExam: speakingExamReducer,
    auth: authReducer,
    speechAnalyzer: speechAnalyzerReducer,
    examAttempts: examAttemptsReducer,
    notification: notificationReducer,
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
