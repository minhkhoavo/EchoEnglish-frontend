export interface PronunciationError {
  type:
    | 'mispronunciation'
    | 'omission'
    | 'insertion'
    | 'unexpected_break'
    | 'missing_break'
    | 'monotone';
  severity?: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
  expectedPhoneme?: string;
  actualPhoneme?: string;
  confidence?: number;
  phonePosition?: number;
  phoneLength?: number;
  syllablePosition?: number;
  errorDetails?: {
    stressAccuracy?: number;
    fluencyScore?: number;
    intonationScore?: number;
    pauseDuration?: number;
    phonePosition?: number;
    phoneLength?: number;
    syllablePosition?: number;
  };
}

export interface Phoneme {
  phoneme: string;
  accuracy: number;
  offset: number;
  duration: number;
  expectedPhoneme?: string;
  actualPhoneme?: string;
  isCorrect?: boolean;
}

export interface WordPronunciation {
  word: string;
  accuracy: number;
  offset: number;
  duration: number;
  phonemes: Phoneme[];
  errors: PronunciationError[];
  isStressed?: boolean;
  isDuplicated?: boolean;
  confidenceScore?: number;
  syllables?: {
    syllable: string;
    stress: boolean;
    accuracy: number;
  }[];
  expectedPronunciation?: string;
  actualPronunciation?: string;
  pronunciationReference?: string;
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: WordPronunciation[];
  overallAccuracy: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoading: boolean;
  error?: string;
}

export type AccuracyLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface AdvancedFeatures {
  rhythm?: {
    score: number;
    pattern: number[];
  };
  intonation?: {
    score: number;
    contour: number[];
  };
  fluency?: {
    score: number;
    pauseLocations: number[];
    speechRate: number;
  };
}

export interface TranscriptData {
  audioUrl: string;
  segments: TranscriptSegment[];
  metadata: {
    duration: number;
    language: string;
    assessmentType: 'pronunciation' | 'fluency' | 'comprehensive';
    createdAt: string;
  };
  advancedFeatures?: AdvancedFeatures;
}
