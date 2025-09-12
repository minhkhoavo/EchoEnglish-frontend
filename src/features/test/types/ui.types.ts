// UI state types for test feature

export interface TestFilters {
  search: string;
  difficulty: string;
  category: string;
  completed: boolean;
  favorites: boolean;
}

export interface TestSession {
  testId: string;
  startTime: number;
  currentQuestionIndex: number;
  answers: Record<string, string>; // { questionId: answer }
  timeRemaining: number;
  isPaused: boolean;
}

export interface TestResult {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: number;
  sections: {
    listening: { score: number; total: number };
    reading: { score: number; total: number };
  };
}

export interface TestUIState {
  // Test list state
  filters: TestFilters;
  viewMode: 'grid' | 'list';
  sortBy: 'title' | 'difficulty' | 'createdAt' | 'completedAt';
  sortDirection: 'asc' | 'desc';
  searchQuery: string;

  // Active test session
  currentSession: TestSession | null;

  // Test results
  lastResult: TestResult | null;
  showResults: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;
}
