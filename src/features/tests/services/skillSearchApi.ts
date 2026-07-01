import { api } from '@/core/api/api';
import { TOEIC_PARTS } from '../constants/toeicSkills';
import { Domain } from '@/features/learning-plan-setup/types';

export interface FindQuestionsBySkillRequest {
  parts?: string[];
  skills?: string[];
  domains?: string[];
  limit?: number;
}

interface FindQuestionsBySkillResponse {
  message: string;
  data: string[];
}

interface ParseSkillSearchRequest {
  message: string;
}

export interface ParseSkillSearchResponse {
  parts?: string[];
  skills?: string[];
  domains?: string[];
  limit?: number;
  message?: string;
  raw?: boolean; // Set by the backend when the AI reply couldn't be parsed as JSON
}

export const buildSkillSearchPrompt = (query: string): string => {
  const skillsByPart = TOEIC_PARTS.map(
    (part) =>
      `- Part ${part.value}: ${part.skills.map((s) => s.value).join(', ') || '(no specific skills, filter by topic only)'}`
  ).join('\n');

  const domains = Object.values(Domain).join(', ');

  return `You convert a learner's natural-language TOEIC practice request into a structured search filter.

AVAILABLE PARTS AND SKILLS:
${skillsByPart}

AVAILABLE TOPICS (lowercase): ${domains}

Rules:
- "parts": TOEIC part numbers as strings (e.g. ["5"]), inferred from context (e.g. "grammar" implies Part 5, "photos" implies Part 1). Leave empty if unclear.
- "skills": exact skill values from the lists above only (case-sensitive, snake_case). Never invent new values. Leave empty if nothing matches clearly.
- "domains": exact topic values from the list above only. Leave empty if no topic is mentioned.
- "limit": number of questions requested; default to 10 if not mentioned, max 50.

Generate a response in JSON format with this structure:
{
  "parts": string[],
  "skills": string[],
  "domains": string[],
  "limit": number
}

Requirements:
- Return ONLY the JSON object, no other text

User request:
"""
${query}
"""`;
};

export const skillSearchApi = api.injectEndpoints({
  endpoints: (builder) => ({
    findQuestionsBySkill: builder.mutation<
      string[],
      FindQuestionsBySkillRequest
    >({
      query: (body) => ({
        url: '/tests/random-questions',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: FindQuestionsBySkillResponse) =>
        response.data,
    }),

    parseSkillSearchQuery: builder.mutation<
      ParseSkillSearchResponse,
      ParseSkillSearchRequest
    >({
      query: (body) => ({
        url: '/chat/message',
        method: 'POST',
        data: body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useFindQuestionsBySkillMutation,
  useParseSkillSearchQueryMutation,
} = skillSearchApi;
