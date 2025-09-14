export interface CEFRLevel {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  name: string;
  percentage: number;
  count: number;
  description: string;
}

export interface VocabularyDistribution {
  totalWords: number;
  uniqueWords: number;
  advancedVocabularyPercentage: number;
  cefrLevels: CEFRLevel[];
}

export interface VocabularyScore {
  overall: number;
  complexity: number;
  variety: number;
  accuracy: number;
  appropriateness: number;
}

export interface TopPerformance {
  category: string;
  description: string;
  score: number;
  level: 'excellent' | 'good' | 'average' | 'needs-improvement';
}

export interface SuggestedWord {
  word: string;
  cefrLevel: CEFRLevel['level'];
  definition: string;
  example: string;
  category: string;
}
