import axios from 'axios';
const URL_KEY = 'omnivoice.url';
const KEY_KEY = 'omnivoice.key';

export interface OmniConfig {
  baseUrl: string;
  apiKey: string;
}

export function getOmniConfig(): OmniConfig {
  const envUrl =
    (import.meta.env.VITE_OMNIVOICE_URL as string | undefined) ?? '';
  return {
    baseUrl: (localStorage.getItem(URL_KEY) || envUrl).replace(/\/+$/, ''),
    apiKey: localStorage.getItem(KEY_KEY) || '',
  };
}

export function setOmniConfig(cfg: Partial<OmniConfig>): void {
  if (cfg.baseUrl !== undefined) localStorage.setItem(URL_KEY, cfg.baseUrl);
  if (cfg.apiKey !== undefined) localStorage.setItem(KEY_KEY, cfg.apiKey);
}

function client() {
  const { baseUrl, apiKey } = getOmniConfig();
  if (!baseUrl) throw new Error('EchoEnglish Voice server URL is not set.');
  return axios.create({
    baseURL: baseUrl,
    headers: {
      // Skip ngrok-free's browser interstitial so API responses aren't HTML.
      'ngrok-skip-browser-warning': 'true',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    timeout: 120_000,
  });
}

export interface OmniProfile {
  id: string;
  name: string;
  kind: string;
}
export interface OmniVoices {
  profiles: OmniProfile[];
}

export interface GeneratePayload {
  question_number?: number;
  range?: { start: number; end: number };
  include_intro?: boolean;
  voice?: string;
  instructions?: string;
  speed?: number;
  gap_ms?: number;
  text?: string;
  stem?: string;
  choices?: { label: string; text: string }[];
  turns?: { text: string; voice?: string; instructions?: string }[];
  response_format?: 'mp3' | 'wav';
}

async function readBlobError(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json?.error?.message ?? text;
  } catch {
    return 'EchoEnglish Voice request failed.';
  }
}

export async function ping(): Promise<boolean> {
  try {
    await client().get('/health');
    return true;
  } catch {
    return false;
  }
}

export async function fetchVoices(): Promise<OmniVoices> {
  const { data } = await client().get<OmniVoices>('/v1/voices');
  return data;
}

export async function createProfile(form: FormData): Promise<OmniProfile> {
  const { data } = await client().post<OmniProfile>('/v1/voices', form);
  return data;
}

export async function generateAudio(payload: GeneratePayload): Promise<Blob> {
  try {
    const { data } = await client().post('/v1/audio/generate', payload, {
      headers: { 'ngrok-skip-browser-warning': 'true' },
      responseType: 'blob',
    });
    return data as Blob;
  } catch (e) {
    const resp = (e as { response?: { data?: unknown } })?.response?.data;
    if (resp instanceof Blob) throw new Error(await readBlobError(resp));
    throw e;
  }
}
