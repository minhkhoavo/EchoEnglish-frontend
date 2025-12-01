export const ResourceType = {
  ARTICLE: 'article',
  WEB_RSS: 'web_rss',
  YOUTUBE: 'youtube',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const Style = {
  FORMAL: 'formal',
  INFORMAL: 'informal',
  ACADEMIC: 'academic',
  CONVERSATIONAL: 'conversational',
} as const;

export type Style = (typeof Style)[keyof typeof Style];

export const Domain = {
  TECHNOLOGY: 'technology',
  BUSINESS: 'business',
  EDUCATION: 'education',
  HEALTH: 'health',
  ENTERTAINMENT: 'entertainment',
  SPORTS: 'sports',
  TRAVEL: 'travel',
  NEWS: 'news',
} as const;

export type Domain = (typeof Domain)[keyof typeof Domain];

export interface ResourceLabels {
  cefr?: string;
  style?: Style;
  domain?: Domain;
  topic?: string[];
  genre?: string;
  setting?: string;
  speechActs?: string[];
}

export interface Resource {
  _id: string;
  type: ResourceType;
  url?: string;
  isArticle?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  isIndexed?: boolean;
  title?: string;
  thumbnail?: string;
  publishedAt?: string;
  lang?: string;
  summary?: string;
  content?: string;
  keyPoints?: string[];
  labels?: ResourceLabels;
  suitableForLearners: boolean;
  moderationNotes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
  end?: number;
}

export interface ResourceSearchParams {
  page?: number;
  limit?: number;
  type?: ResourceType;
  q?: string;
  suitableForLearners?: boolean;
  sortBy?: 'newest' | 'oldest' | 'title';
  isAdmin?: boolean;
}

export interface VocabularyItem {
  selectedText: string;
  category: string;
  englishMeaning: string;
  vietnameseMeaning: string;
  timestamp?: number;
}

export interface ResourceSearchResponse {
  data: {
    resources: Resource[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    counts?: {
      all: number;
      articles: number;
      videos: number;
    };
  };
  message: string;
}
