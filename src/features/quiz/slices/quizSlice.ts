import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface QuizQuestionBuilder {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'listening' | 'reading' | 'vocabulary' | 'grammar' | 'multiple-choice';
  question: {
    text?: string;
    image?: string;
    audio?: string;
    imageGroup?: string[];
  };
  options: QuizOption[];
  correctAnswer: string; 
  explanation?: {
    text?: string;
    audio?: string;
  };
  timeLimit?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalTime: number;
}

export interface QuizResult {
  score: number;
  total: number;
  correctAnswers: Record<string, boolean>;
}

interface QuizState {
  // Quiz Builder State
  builderQuestions: QuizQuestionBuilder[];
  currentBuilderQuestion: Partial<QuizQuestionBuilder>;
  activeQuiz: Quiz | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>; // { questionId: optionId }
  showResults: boolean;
  timeLeft: number;
  isPlayingAudio: Record<string, boolean>; // { audioId: boolean }
  isReviewMode: boolean;
  reviewQuestionIndex: number | null; 
  quizResult: QuizResult | null;
}

const initialState: QuizState = {
  builderQuestions: [],
  currentBuilderQuestion: {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
  },
  activeQuiz: null,
  currentQuestionIndex: 0,
  selectedAnswers: {},
  showResults: false,
  timeLeft: 0,
  isPlayingAudio: {},
  isReviewMode: false,
  reviewQuestionIndex: null,
  quizResult: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    addBuilderQuestion: (state, action: PayloadAction<QuizQuestionBuilder>) => {
      state.builderQuestions.push(action.payload);
      state.currentBuilderQuestion = {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
      };
    },
    updateCurrentBuilderQuestion: (state, action: PayloadAction<Partial<QuizQuestionBuilder>>) => {
      state.currentBuilderQuestion = { ...state.currentBuilderQuestion, ...action.payload };
    },
    updateBuilderOption: (state, action: PayloadAction<{ index: number; value: string }>) => {
      if (state.currentBuilderQuestion.options) {
        state.currentBuilderQuestion.options[action.payload.index] = action.payload.value;
      }
    },
    setActiveQuiz: (state, action: PayloadAction<Quiz | null>) => {
      state.activeQuiz = action.payload;
      state.currentQuestionIndex = 0;
      state.timeLeft = action.payload?.totalTime || 0;
    },
    nextQuestion: (state) => {
      if (state.activeQuiz && state.currentQuestionIndex < state.activeQuiz.questions.length - 1) {
        state.currentQuestionIndex += 1;
      } else if (state.activeQuiz && state.currentQuestionIndex === state.activeQuiz.questions.length - 1) {
        state.showResults = true;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    selectAnswer: (state, action: PayloadAction<{ questionId: string; optionId: string }>) => {
      state.selectedAnswers[action.payload.questionId] = action.payload.optionId;
    },
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },
    setIsPlayingAudio: (state, action: PayloadAction<{ audioId: string; isPlaying: boolean }>) => {
      state.isPlayingAudio[action.payload.audioId] = action.payload.isPlaying;
    },
    resetQuizInterface: (state) => {
      state.currentQuestionIndex = 0;
      state.selectedAnswers = {};
      state.showResults = false;
      state.timeLeft = state.activeQuiz?.totalTime || 0;
      state.isPlayingAudio = {};
      state.isReviewMode = false;
      state.reviewQuestionIndex = null;
      state.quizResult = null;
    },
    setReviewMode: (state, action: PayloadAction<{ isReviewMode: boolean; reviewQuestionIndex: number | null }>) => {
      state.isReviewMode = action.payload.isReviewMode;
      state.reviewQuestionIndex = action.payload.reviewQuestionIndex;
    },
    setQuizResult: (state, action: PayloadAction<QuizResult>) => {
      state.quizResult = action.payload;
    },
  },
});

export const {
  addBuilderQuestion,
  updateCurrentBuilderQuestion,
  updateBuilderOption,
  setActiveQuiz,
  nextQuestion,
  previousQuestion,
  selectAnswer,
  setShowResults,
  setTimeLeft,
  setIsPlayingAudio,
  resetQuizInterface,
  setReviewMode,
  setQuizResult,
} = quizSlice.actions;

export default quizSlice.reducer;
