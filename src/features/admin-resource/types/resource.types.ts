export const ResourceType = {
  ARTICLE: 'article',
  VIDEO: 'video',
} as const;

export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export interface ResourceLabels {
  domain?: string;
  [key: string]: unknown;
}

export interface Resource {
  _id: string;
  type: ResourceType;
  url: string;
  title?: string;
  publishedAt?: string;
  lang?: string;
  summary?: string;
  content?: string;
  keyPoints?: string[];
  suitableForLearners: boolean;
  moderationNotes?: string;
  labels?: ResourceLabels;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceFilters {
  type?: ResourceType | string;
  suitableForLearners?: string;
  q?: string;
  limit?: number;
  sort?: 'newest' | 'oldest';
}
