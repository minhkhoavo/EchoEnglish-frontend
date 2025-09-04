export interface ContentItem {
  id: string;
  name: string;
  type: 'file' | 'url' | 'image';
  size?: string;
  url?: string;
  preview?: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
  metadata?: ContentMetadata;
  toeicParts?: ToeicParts;
  language?: string;
  textQuality?: number;
  tokenLength?: number;
  insights?: ContentInsights;
}

export interface ContentMetadata {
  domain: string[];
  genre: string[];
  setting: string[];
  style: string;
  difficulty: string;
  summary: string;
}

export interface ToeicParts {
  part2: boolean;
  part3: boolean;
  part4: boolean;
  part5: boolean;
  part6: boolean;
  part7: boolean;
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
