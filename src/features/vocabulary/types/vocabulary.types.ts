export interface VocabularySet {
  fileName: string;
  name: string;
  description: string;
  wordCount: number;
  group_id: string;
  group_name: string;
  deck_id: string;
  deck_name: string;
}

export interface VocabularyWord {
  card_id: string;
  word: string;
  explanation: {
    en?: string;
    vi?: string;
  };
  translation: {
    vi?: string;
  };
  type: string;
  phonetics: Array<{
    text: string;
    audio?: string;
    locale?: string;
  }>;
  example: {
    en?: string;
    vi?: string;
  };
  image_url?: string;
  difficulty?: string;
  group_id: string;
  group_name: string;
}

export interface VocabularyWordsResponse {
  words: VocabularyWord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalWords: number;
    limit: number;
  };
}

export interface PhoneticData {
  text: string;
  audio?: string;
}

export interface PhoneticsResponse {
  word: string;
  phonetics: PhoneticData[];
  formatted: string;
}

export interface ImportResponse {
  message: string;
  data?: {
    alreadyImported?: boolean;
    [key: string]: unknown;
  };
}

export interface BulkImportResponse {
  message: string;
  data: {
    imported: number;
    skipped: number;
    flashcards: unknown[];
  };
}
