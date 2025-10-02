export type AnalysisStatus = 'done' | 'processing' | 'failed';

export interface Recording {
  _id: string;
  userId: string;
  name: string;
  url: string;
  duration: number;
  speakingTime: number;
  mimeType: string;
  size: number;
  transcript: string;
  createdAt: string;
  analysisStatus: AnalysisStatus;
  __v?: number;
  overallScore?: number;
  analysis?: unknown;
}

export interface RecordingsListResponse {
  message: string;
  data: {
    items: Recording[];
  };
}

export interface RecordingsState {
  recordings: Recording[];
  isLoading: boolean;
  error: string | null;
}
