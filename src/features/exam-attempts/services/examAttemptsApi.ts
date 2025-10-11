import { api } from '@/core/api/api';
import type {
  ListeningReadingResponse,
  SpeakingAttemptsResponse,
  WritingAttemptsResponse,
  ExamAttempt,
  ListeningReadingResult,
  SpeakingAttempt,
  WritingAttempt,
} from '../types';

// Data transformation functions
const transformListeningReadingResult = (
  result: ListeningReadingResult
): ExamAttempt => {
  return {
    id: result.id,
    type: 'listening-reading',
    status: 'completed',
    title: result.testTitle,
    description: result.partsKey,
    startedAt: result.completedAt,
    duration: result.duration,
    score: result.score,
    maxScore: 990,
    percentage: result.percentage,
  };
};

const transformSpeakingAttempt = (attempt: SpeakingAttempt): ExamAttempt => {
  return {
    id: attempt._id,
    type: 'speaking',
    status: attempt.status === 'completed' ? 'completed' : 'in-progress',
    title: `TOEIC Speaking Test ${attempt.testIdNumeric}`,
    description: attempt.level,
    startedAt: attempt.createdAt,
    score: attempt.scoreOverall,
    maxScore: 200,
    percentage: attempt.scoreOverall
      ? (attempt.scoreOverall / 200) * 100
      : undefined,
  };
};

const transformWritingAttempt = (attempt: WritingAttempt): ExamAttempt => {
  return {
    id: attempt._id,
    type: 'writing',
    status: attempt.status === 'completed' ? 'completed' : 'in-progress',
    title: `TOEIC Writing Test ${attempt.testIdNumeric}`,
    description: attempt.overallLevel,
    startedAt: attempt.createdAt,
    score: attempt.overallScore,
    maxScore: 200,
    percentage: attempt.overallScore
      ? (attempt.overallScore / 200) * 100
      : undefined,
  };
};

// API endpoints
export const examAttemptsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getListeningReadingResults: builder.query<ExamAttempt[], void>({
      query: () => ({
        url: '/test-results/listening-reading',
        method: 'GET',
      }),
      transformResponse: (response: ListeningReadingResponse) => {
        return response.data.map(transformListeningReadingResult);
      },
      providesTags: ['TestResult'],
    }),
    getSpeakingAttempts: builder.query<ExamAttempt[], void>({
      query: () => ({
        url: '/api/v1/speaking-attempts',
        method: 'GET',
      }),
      transformResponse: (response: SpeakingAttemptsResponse) => {
        return response.data.map(transformSpeakingAttempt);
      },
      providesTags: ['SpeakingTest'],
    }),
    getWritingAttempts: builder.query<ExamAttempt[], void>({
      query: () => ({
        url: '/writing-results',
        method: 'GET',
      }),
      transformResponse: (response: WritingAttemptsResponse) => {
        return response.data.map(transformWritingAttempt);
      },
      providesTags: ['WritingTest'],
    }),
  }),
});

export const {
  useGetListeningReadingResultsQuery,
  useGetSpeakingAttemptsQuery,
  useGetWritingAttemptsQuery,
} = examAttemptsApi;
