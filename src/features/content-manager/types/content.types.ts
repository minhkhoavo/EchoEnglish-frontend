export interface ContentItem {
  id: string;
  name: string;
  type: 'file' | 'url' | 'image';
  size?: string;
  url?: string;
  preview?: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  insights?: ContentInsights;
}

export interface ContentInsights {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  readingTime: string;
  vocabulary: number;
  suggestedQuizzes: number;
  suggestedFlashcards: number;
}

export interface UploadProgress {
  itemId: string;
  progress: number;
}

export interface GenerationResult {
  success: boolean;
  count: number;
  message: string;
}

export type ContentStatus = 'uploaded' | 'processing' | 'ready' | 'error';
export type GenerationType = 'quiz' | 'flashcards';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
