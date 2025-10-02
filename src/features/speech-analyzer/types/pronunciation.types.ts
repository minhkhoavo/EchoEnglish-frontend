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

export interface TranscriptData {
  audioUrl: string;
  segments: TranscriptSegment[];
  metadata: {
    duration: number;
    speakingTime: number;
    language: string;
    assessmentType: 'pronunciation' | 'fluency' | 'comprehensive';
    createdAt: string;
  };
}

export interface SkillResource {
  title: string;
  url: string;
  type?: string;
}

export interface SkillEntry {
  title: string;
  level: string;
  resources: SkillResource[];
}

export interface TopMistake {
  sound: string;
  errorRate: number;
  mistakeSummary: string;
  wordsWithMistakes: Array<{
    word: string;
    phoneticTranscription?: string;
  }>;
  howToImprove: string;
  skillsData: SkillEntry[];
}

export interface RecordingOverallScores {
  AccuracyScore: number;
  FluencyScore: number;
  ProsodyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

export interface RecordingAnalysis extends TranscriptData {
  overall: RecordingOverallScores;
  analyses: {
    pronunciation: {
      chartData: Array<{ sound: string; errorRate: number }>;
      topMistakes: TopMistake[];
    };
    prosody: {
      pitch_range_max: number;
      pitch_range_min: number;
      energy_range_max: number;
      energy_range_min: number;
      pitch_points: Array<{ time: number; value: number }>;
      energy_points: Array<{ time: number; value: number }>;
    };
    fluency: {
      words_per_minute: number;
      pausing_score: number;
      pausing_decision: string;
      points: Array<{ time: number; value: number }>;
      feedbacks: Array<{
        start_time: number;
        duration: number;
        start_index: number;
        end_index: number;
        correctness: string;
      }>;
    };
    vocabulary: {
      paraphraseSuggestions: Array<{
        original: string;
        paraphrase: string;
        technique: string;
      }>;
      topPerformances: Array<{
        category: string;
        description: string;
        score: number;
        level: string;
      }>;
      suggestedWords: Array<{
        word: string;
        cefrLevel: string;
        definition: string;
        example: string;
        category: string;
      }>;
      vocabularyUpgrades: Array<{
        basic: string;
        advanced: string;
        context: string;
        example: string;
      }>;
      stats: {
        totalWords: number;
        uniqueWords: number;
        knownWords: number;
        unknownWords: number;
        distribution: {
          A1: number;
          A2: number;
          B1: number;
          B2: number;
          C1: number;
          C2: number;
        };
        topAdvanced: Array<unknown>;
      };
    };
    [key: string]: unknown;
  };
}
