export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  source?: string;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  reviewCount?: number;
  correctCount?: number;
  lastReviewed?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  flashcardCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface FlashcardFilters {
  search: string;
  category: string;
  difficulty: string;
  tags: string[];
  favorites: boolean;
  aiGenerated: boolean;
}

export const sortOptions: {
  label: string;
  value: string;
  direction: 'asc' | 'desc';
}[] = [
  { label: 'Created (Newest)', value: 'createdAt', direction: 'desc' },
  { label: 'Created (Oldest)', value: 'createdAt', direction: 'asc' },
  { label: 'Updated (Newest)', value: 'updatedAt', direction: 'desc' },
  { label: 'Name (A-Z)', value: 'front', direction: 'asc' },
  { label: 'Name (Z-A)', value: 'front', direction: 'desc' },
  { label: 'Difficulty (Easy first)', value: 'difficulty', direction: 'asc' },
  { label: 'Difficulty (Hard first)', value: 'difficulty', direction: 'desc' },
  { label: 'Review Count', value: 'reviewCount', direction: 'desc' },
];
