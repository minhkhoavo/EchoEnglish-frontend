export interface Flashcard {
  _id?: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  source?: string;
  isAIGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createBy: string;
  updateBy: string;
}

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  flashcardCount?: number;
  createdAt?: string;
  updateAt?: string;
}

export interface FlashcardWithCategory extends Omit<Flashcard, 'category'> {
  category: Category;
}

export interface FlashcardsByCategoryResponse {
  flashcards: FlashcardWithCategory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
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
