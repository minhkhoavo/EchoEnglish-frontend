export const Domain = {
  BUSINESS: 'business',
  OFFICE: 'office',
  FINANCE: 'finance',
  TECHNOLOGY: 'technology',
  EDUCATION: 'education',
  HEALTHCARE: 'healthcare',
  TRAVEL: 'travel',
  HOSPITALITY: 'hospitality',
  MANUFACTURING: 'manufacturing',
  HUMAN_RESOURCES: 'human_resources',
  MARKETING: 'marketing',
  CUSTOMER_SERVICE: 'customer_service',
  LOGISTICS: 'logistics',
  RETAIL: 'retail',
  REAL_ESTATE: 'real_estate',
  LEGAL_COMPLIANCE: 'legal_compliance',
  SAFETY: 'safety',
  NEWS: 'news',
  ENTERTAINMENT: 'entertainment',
  SPORTS: 'sports',
  POLITICS: 'politics',
  ENVIRONMENT: 'environment',
  SCIENCE: 'science',
  MEDIA: 'media',
  LEGAL: 'legal',
  OUTDOOR_RECREATION: 'outdoor_recreation',
  COOKING: 'cooking',
  HOUSE: 'house',
  GENERAL: 'general',
  TECHNICAL: 'technical',
  DAILY_LIFE: 'daily_life',
  HEALTH: 'health',
} as const;

export type Domain = (typeof Domain)[keyof typeof Domain];

export type PrimaryGoal =
  | 'toeic_preparation'
  | 'career_advancement'
  | 'business_english'
  | 'academic_excellence';

export type StudyTimePerDay = 15 | 30 | 60 | 120;

export type WeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Monday, 7=Sunday

export type PreferredStudyTime = 'morning' | 'afternoon' | 'evening' | 'night';

export type CurrentLevel =
  | 'beginner'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced';

export interface UserPreferences {
  primaryGoal: PrimaryGoal;
  targetScore: number; // 100-990
  targetDate: string; // ISO date string
  studyTimePerDay: StudyTimePerDay;
  weeklyStudyDays: number; // 1-7
  studyDaysOfWeek: WeekDay[];
  preferredStudyTime: PreferredStudyTime;
  contentInterests: Domain[];
  currentLevel: CurrentLevel;
  lastUpdated?: string;
}

export interface UserPreferencesPartial {
  primaryGoal?: PrimaryGoal;
  targetScore?: number;
  targetDate?: string;
  studyTimePerDay?: StudyTimePerDay;
  weeklyStudyDays?: number;
  studyDaysOfWeek?: WeekDay[];
  preferredStudyTime?: PreferredStudyTime;
  contentInterests?: Domain[];
  currentLevel?: CurrentLevel;
}

export interface GenerateLearningPlanRequest {
  currentScore?: number;
  targetScore: number;
  studyTimePerDay: StudyTimePerDay;
  weeklyStudyDays: number;
  userPrompt?: string;
}

export interface LearningPlan {
  id: string;
  userId: string;
  preferences: UserPreferences;
  generatedAt: string;
  status: 'active' | 'completed' | 'expired';
  // Add more fields as per your backend response
  [key: string]: unknown;
}

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  toeic_preparation: 'TOEIC Preparation',
  career_advancement: 'Career Advancement',
  business_english: 'Business English',
  academic_excellence: 'Academic Excellence',
};

export const STUDY_TIME_OPTIONS: StudyTimePerDay[] = [15, 30, 60, 120];

export const PREFERRED_STUDY_TIME_LABELS: Record<PreferredStudyTime, string> = {
  morning: 'Morning (6AM - 12PM)',
  afternoon: 'Afternoon (12PM - 6PM)',
  evening: 'Evening (6PM - 9PM)',
  night: 'Night (9PM - 12AM)',
};

export const CURRENT_LEVEL_LABELS: Record<CurrentLevel, string> = {
  beginner: 'Beginner (0-400)',
  intermediate: 'Intermediate (405-600)',
  upper_intermediate: 'Upper Intermediate (605-780)',
  advanced: 'Advanced (785-990)',
};

export const WEEKDAY_LABELS: Record<WeekDay, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  [Domain.BUSINESS]: 'Business',
  [Domain.OFFICE]: 'Office',
  [Domain.FINANCE]: 'Finance',
  [Domain.TECHNOLOGY]: 'Technology',
  [Domain.EDUCATION]: 'Education',
  [Domain.HEALTHCARE]: 'Healthcare',
  [Domain.TRAVEL]: 'Travel',
  [Domain.HOSPITALITY]: 'Hospitality',
  [Domain.MANUFACTURING]: 'Manufacturing',
  [Domain.HUMAN_RESOURCES]: 'Human Resources',
  [Domain.MARKETING]: 'Marketing',
  [Domain.CUSTOMER_SERVICE]: 'Customer Service',
  [Domain.LOGISTICS]: 'Logistics',
  [Domain.RETAIL]: 'Retail',
  [Domain.REAL_ESTATE]: 'Real Estate',
  [Domain.LEGAL_COMPLIANCE]: 'Legal & Compliance',
  [Domain.SAFETY]: 'Safety',
  [Domain.NEWS]: 'News',
  [Domain.ENTERTAINMENT]: 'Entertainment',
  [Domain.SPORTS]: 'Sports',
  [Domain.POLITICS]: 'Politics',
  [Domain.ENVIRONMENT]: 'Environment',
  [Domain.SCIENCE]: 'Science',
  [Domain.MEDIA]: 'Media',
  [Domain.LEGAL]: 'Legal',
  [Domain.OUTDOOR_RECREATION]: 'Outdoor Recreation',
  [Domain.COOKING]: 'Cooking',
  [Domain.HOUSE]: 'House',
  [Domain.GENERAL]: 'General',
  [Domain.TECHNICAL]: 'Technical',
  [Domain.DAILY_LIFE]: 'Daily Life',
  [Domain.HEALTH]: 'Health',
};
