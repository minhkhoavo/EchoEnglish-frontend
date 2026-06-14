import { api } from '@/core/api/api';

export type VoiceKind = 'builtin' | 'design' | 'clone';

export interface VoiceProfile {
  id: string;
  name: string;
  kind: VoiceKind;
  accent?: string;
  gender?: string;
}

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'american-male',
    name: 'American Male',
    kind: 'builtin',
    accent: 'american',
    gender: 'male',
  },
  {
    id: 'american-female',
    name: 'American Female',
    kind: 'builtin',
    accent: 'american',
    gender: 'female',
  },
  {
    id: 'british-male',
    name: 'British Male',
    kind: 'builtin',
    accent: 'british',
    gender: 'male',
  },
  {
    id: 'british-female',
    name: 'British Female',
    kind: 'builtin',
    accent: 'british',
    gender: 'female',
  },
  { id: 'design', name: 'Custom (Voice Design)', kind: 'design' },
  { id: 'clone', name: 'Clone from my audio', kind: 'clone' },
];

/** Built-in voices only — for conversation turns. */
export const BUILTIN_VOICE_PROFILES = VOICE_PROFILES.filter(
  (v) => v.kind === 'builtin'
);

export const DESIGN_ATTRIBUTES = {
  gender: ['male', 'female'],
  accent: ['american accent', 'british accent', 'australian accent'],
  age: ['child', 'teenager', 'young adult', 'middle-aged', 'elderly'],
  pitch: [
    'very low pitch',
    'low pitch',
    'moderate pitch',
    'high pitch',
    'very high pitch',
  ],
  style: ['whisper'],
} as const;

export type DesignAttrKey = keyof typeof DESIGN_ATTRIBUTES;

export interface IntroContext {
  /** Single-question intro (Parts 1, 2). */
  questionNumber?: number;
  /** Group intro (Parts 3, 4). */
  range?: { start: number; end: number };
}

export interface ConversationTurn {
  voiceProfileId: string;
  text: string;
}

export interface GenerateRequest {
  mode: 'single' | 'conversation';
  voiceProfileId?: string;
  text?: string;
  /** Single mode: lines read in order with a pause between each. */
  segments?: string[];
  turns?: ConversationTurn[];
  speed?: number;
  gapMs?: number;
  instructions?: string;
  /** Voice cloning: S3 URL of an uploaded reference sample. */
  refAudioUrl?: string;
  refText?: string;
  intro?: IntroContext;
}

export interface GenerateResult {
  url: string;
  meta: {
    mode: GenerateRequest['mode'];
    voiceProfileId?: string;
    speed?: number;
    intro?: IntroContext;
    hadIntro: boolean;
    generatedAt: string;
  };
}

export interface VoiceSettings {
  baseUrl?: string;
  model?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export const voiceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    generateAudio: builder.mutation<GenerateResult, GenerateRequest>({
      query: (body) => ({ url: '/voice/generate', method: 'POST', data: body }),
      transformResponse: (r: ApiEnvelope<GenerateResult>) => r.data,
    }),

    getVoiceSettings: builder.query<VoiceSettings, void>({
      query: () => ({ url: '/voice/settings', method: 'GET' }),
      transformResponse: (r: ApiEnvelope<VoiceSettings>) => r.data,
      providesTags: ['Voice'],
    }),

    updateVoiceSettings: builder.mutation<VoiceSettings, VoiceSettings>({
      query: (body) => ({ url: '/voice/settings', method: 'PUT', data: body }),
      transformResponse: (r: ApiEnvelope<VoiceSettings>) => r.data,
      invalidatesTags: ['Voice'],
    }),
  }),
});

export const {
  useGenerateAudioMutation,
  useGetVoiceSettingsQuery,
  useUpdateVoiceSettingsMutation,
} = voiceApi;
