// Types for Azure Pronunciation Assessment and enhanced transcript features

export interface PronunciationError {
  type: 'mispronunciation' | 'omission' | 'insertion' | 'unexpected_break' | 'missing_break' | 'monotone';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
  expectedPhoneme?: string; // What should have been pronounced
  actualPhoneme?: string;   // What was actually pronounced
  confidence?: number;      // Confidence in error detection (0-100)
  // Additional Azure-specific fields
  phonePosition?: number;   // Position of the phoneme in the word
  phoneLength?: number;     // Length of the phoneme
  syllablePosition?: number; // Position within syllable
  errorDetails?: {
    stressAccuracy?: number;  // For stress-related errors
    fluencyScore?: number;    // For rhythm/fluency issues
    intonationScore?: number; // For monotone/intonation issues
    pauseDuration?: number;   // For break-related errors
    phonePosition?: number;   // Position of problematic phoneme
    phoneLength?: number;     // Length of problematic phoneme
    syllablePosition?: number; // Position within syllable
  };
}

export interface Phoneme {
  phoneme: string;
  accuracy: number; // 0-100
  offset: number; // milliseconds
  duration: number; // milliseconds
  expectedPhoneme?: string; // Expected pronunciation
  actualPhoneme?: string;   // Actual pronunciation detected
  isCorrect?: boolean;      // Quick check if phoneme is correct
}

export interface WordPronunciation {
  word: string;
  accuracy: number; // 0-100 overall accuracy score
  offset: number; // start time in milliseconds
  duration: number; // duration in milliseconds
  phonemes: Phoneme[];
  errors: PronunciationError[];
  isStressed?: boolean; // for stress word highlighting
  isDuplicated?: boolean; // for duplicated words
  confidenceScore?: number; // confidence level of assessment
  syllables?: {
    syllable: string;
    stress: boolean;
    accuracy: number;
  }[];
  // Pronunciation reference data
  expectedPronunciation?: string; // IPA transcription of correct pronunciation
  actualPronunciation?: string;   // IPA transcription of detected pronunciation
  pronunciationReference?: string; // Human-readable pronunciation guide (e.g., "NEED")
}

export interface TranscriptSegment {
  id: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  text: string;
  words: WordPronunciation[];
  overallAccuracy: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number; // milliseconds
  duration: number; // milliseconds
  volume: number; // 0-1
  playbackRate: number; // 0.5, 1, 1.25, 1.5, 2
  isLoading: boolean;
  error?: string;
}

export interface PronunciationTooltipData {
  word: string;
  accuracy: number;
  phonemes: Phoneme[];
  errors: PronunciationError[];
  tips: string[];
  position: {
    x: number;
    y: number;
  };
}

// Color coding based on accuracy levels
export type AccuracyLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface AccuracyThresholds {
  excellent: number; // 90-100%
  good: number; // 70-89%
  fair: number; // 50-69%
  poor: number; // 0-49%
}

// Stress pattern for advanced features
export interface StressPattern {
  wordIndex: number;
  syllableIndex: number;
  type: 'primary' | 'secondary' | 'unstressed';
  emphasis: number; // multiplier for font size/weight
}

// For future features like rhythm, intonation
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
