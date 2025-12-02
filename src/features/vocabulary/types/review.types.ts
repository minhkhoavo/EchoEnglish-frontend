export interface Flashcard {
  _id: string;
  front: string;
  back: string;
  difficulty: string;
  level_memory: number;
  nextReviewDate?: string;
  lastReviewDate?: string;
  reviewCount: number;
  source?: string;
  phonetic?: string;
  category?: {
    _id: string;
    name: string;
    description?: string;
    color?: string;
  };
}

export interface ReviewStatistics {
  total: number;
  byLevel: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  dueForReview: number;
  percentMastered: number;
  recommendedDaily: number;
}

export interface DueFlashcardsResponse {
  flashcards: Flashcard[];
  count: number;
}
