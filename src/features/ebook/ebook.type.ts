// ============================================================================
// EBOOK TYPES - Hệ thống sách điện tử với react-reader
// ============================================================================

/**
 * Reading theme
 */
export const ReadingTheme = {
  LIGHT: 'light',
  DARK: 'dark',
  SEPIA: 'sepia',
} as const;

export type ReadingTheme = (typeof ReadingTheme)[keyof typeof ReadingTheme];

// ============================================================================
// READER SETTINGS
// ============================================================================

/**
 * Reader display settings (for react-reader)
 */
export interface ReaderSettings {
  theme: ReadingTheme;
  fontSize: number; // percentage 80-150
  enableTTS: boolean;
  ttsSpeed: number; // 0.5 - 2.0
  ttsVoice?: string;
}

/**
 * Default reader settings
 */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontSize: 100,
  enableTTS: true,
  ttsSpeed: 1.0,
};

// ============================================================================
// USER PROGRESS & INTERACTIONS (localStorage)
// ============================================================================

/**
 * Reading progress (stored in localStorage)
 */
export interface EbookProgress {
  ebookId: string;
  location: string; // EPUB CFI location
  percentage: number; // 0-100
  currentPage: number;
  totalPages: number;
  lastReadAt: Date;
}

/**
 * Bookmark (stored in localStorage)
 */
export interface EbookBookmark {
  id: string;
  cfi: string; // EPUB CFI location
  label: string;
  createdAt: Date;
}

/**
 * Highlight/Note (stored in localStorage)
 */
export interface EbookNote {
  id: string;
  cfiRange: string;
  text: string;
  note: string;
  color: string;
  createdAt: Date;
}

// ============================================================================
// EBOOK SOURCES
// ============================================================================

/**
 * External ebook source
 */
export interface EbookSource {
  id: string;
  name: string;
  baseUrl: string;
  apiUrl?: string;
  license: 'public_domain' | 'creative_commons' | 'free' | 'paid';
  description?: string;
}

/**
 * Predefined ebook sources
 */
export const EBOOK_SOURCES: EbookSource[] = [
  {
    id: 'gutenberg',
    name: 'Project Gutenberg',
    baseUrl: 'https://www.gutenberg.org',
    apiUrl: 'https://gutendex.com/books',
    license: 'public_domain',
    description: 'Free ebooks from public domain literature',
  },
  {
    id: 'standard-ebooks',
    name: 'Standard Ebooks',
    baseUrl: 'https://standardebooks.org',
    license: 'public_domain',
    description: 'Beautifully formatted public domain ebooks',
  },
  {
    id: 'open-library',
    name: 'Open Library',
    baseUrl: 'https://openlibrary.org',
    apiUrl: 'https://openlibrary.org/api',
    license: 'free',
    description: 'Digital library with millions of free books',
  },
];

// ============================================================================
// CORS-ENABLED EPUB URLS
// ============================================================================

export const EPUB_URLS = {
  mobyDick: 'https://s3.amazonaws.com/moby-dick/moby-dick.epub',
  aliceWonderland: 'https://s3.amazonaws.com/epubjs/books/alice.epub',
} as const;

// ============================================================================
// EBOOK DATA TYPE
// ============================================================================

export interface EbookData {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  epubUrl: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  duration: string;
  pages: number;
  rating: number;
  progress?: number;
  lastReadAt?: Date;
}
