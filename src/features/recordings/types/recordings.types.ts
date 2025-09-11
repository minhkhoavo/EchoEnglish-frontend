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
  overallScore?: number;
  analysis?: unknown;
  analysisStatus?: string;
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
