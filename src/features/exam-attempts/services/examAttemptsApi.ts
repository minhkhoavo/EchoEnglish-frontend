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
    listeningScore: result.listeningScore,
    readingScore: result.readingScore,
    score: result.listeningScore + result.readingScore,
    maxScore: 990,
    percentage: result.percentage,
  };
};

const transformSpeakingAttempt = (attempt: SpeakingAttempt): ExamAttempt => {
  return {
    id: attempt._id,
    type: 'speaking',
    status: attempt.status === 'completed' ? 'completed' : 'in-progress',
    title: `TOEIC Speaking Test`,
    description: attempt.level,
    startedAt: attempt.createdAt,
    score: attempt.status === 'completed' ? attempt.totalScore : 0,
    maxScore: 200,
    percentage:
      attempt.status === 'completed' && attempt.totalScore
        ? (attempt.totalScore / 200) * 100
        : undefined,
    toeicSpeakingTestId: attempt.toeicSpeakingTestId,
  };
};

const transformWritingAttempt = (attempt: WritingAttempt): ExamAttempt => {
  return {
    id: attempt._id,
    type: 'writing',
    status: attempt.status === 'completed' ? 'completed' : 'in-progress',
    title: `TOEIC Writing Test`,
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
    }),
    getSpeakingAttempts: builder.query<ExamAttempt[], void>({
      query: () => ({
        url: '/api/v1/speaking-attempts',
        method: 'GET',
      }),
      transformResponse: (response: SpeakingAttemptsResponse) => {
        console.log('Speaking Attempts Response:', response);
        return response.data.map(transformSpeakingAttempt);
      },
    }),
    getWritingAttempts: builder.query<ExamAttempt[], void>({
      query: () => ({
        url: '/writing-results',
        method: 'GET',
      }),
      transformResponse: (response: WritingAttemptsResponse) => {
        return response.data.map(transformWritingAttempt);
      },
    }),
  }),
});

export const {
  useGetListeningReadingResultsQuery,
  useGetSpeakingAttemptsQuery,
  useGetWritingAttemptsQuery,
} = examAttemptsApi;
