export const ResourceType = {
  ARTICLE: 'article',
  VIDEO: 'video',
  WEB_RSS: 'web_rss',
  YOUTUBE: 'youtube',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export interface ResourceLabels {
  cefr?: string;
  domain?: string;
  topic?: string[];
  [key: string]: unknown;
}

export interface Resource {
  _id: string;
  type: ResourceType;
  isArticle?: boolean;
  url?: string;
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
  suitableForLearners: boolean;
  moderationNotes?: string;
  labels?: ResourceLabels;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceFilters {
  type?: ResourceType | string;
  suitableForLearners?: string;
  isArticle?: string;
  q?: string;
  limit?: number;
  sort?: 'newest' | 'oldest';
}

export interface CreateArticleData {
  title: string;
  content: string;
  summary?: string;
  thumbnail?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  labels?: ResourceLabels;
  suitableForLearners?: boolean;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  summary?: string;
  thumbnail?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  labels?: ResourceLabels;
  suitableForLearners?: boolean;
}
