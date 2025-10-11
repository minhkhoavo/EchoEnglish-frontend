import { api } from '@/core/api/api';
import type {
  WritingTest,
  WritingTestDetail,
  WritingTestsApiResponse,
  WritingTestDetailApiResponse,
} from '../types/writing-test.types';

// API Response interfaces
interface ApiQuestion {
  _id: string;
  questionText: string;
  offset: number; // Question number (1, 2, 3...)
  [key: string]: unknown;
}

interface ApiPart {
  _id: string;
  partName: string;
  offset: number; // Part number (1, 2, 3)
  questions: ApiQuestion[];
  [key: string]: unknown;
}

export const writingTestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tests
    getWritingTests: builder.query<WritingTest[], void>({
      query: () => ({
        url: '/sw-tests/?type=writing',
        method: 'GET',
      }),
      transformResponse: (response: WritingTestsApiResponse) => {
        // Map _id to testId and ensure it's always a string
        return response.data.map((test) => {
          const testWithId = test as unknown as {
            _id?: string | { $oid: string };
          };
          const id =
            typeof testWithId._id === 'string'
              ? testWithId._id
              : String(testWithId._id);
          return {
            ...test,
            testId: id,
          };
        });
      },
      providesTags: ['WritingTest'],
    }),

    // Get test by ID
    getWritingTestById: builder.query<WritingTestDetail, string>({
      query: (testId) => ({
        url: `/sw-tests/${testId}`,
        method: 'GET',
      }),
      transformResponse: (response: WritingTestDetailApiResponse) => {
        const data = response.data;
        // Transform using offset (question number) as ID instead of parsing ObjectId
        return {
          ...data,
          parts: data.parts.map((part) => {
            const apiPart = part as unknown as ApiPart;
            return {
              ...part,
              id: apiPart.offset, // Use part offset (1, 2, 3) as ID
              title: apiPart.partName || part.title,
              questions: part.questions.map((question) => {
                const apiQuestion = question as unknown as ApiQuestion;
                return {
                  ...question,
                  id: apiQuestion.offset, // Use question offset (1, 2, 3...) as ID
                  title: apiQuestion.questionText || question.title,
                };
              }),
            };
          }),
        } as WritingTestDetail;
      },
      providesTags: (result, error, id) => [
        { type: 'WritingTest' as const, id },
      ],
    }),

    // Get test by part
    getWritingTestByPart: builder.query<
      WritingTestDetail,
      { testId: string; partNumber: number }
    >({
      query: ({ testId, partNumber }) => ({
        url: `/sw-tests/${testId}/part/${partNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: WritingTestDetailApiResponse) =>
        response.data,
      providesTags: (result, error, { testId, partNumber }) => [
        { type: 'WritingTest' as const, id: `${testId}-${partNumber}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWritingTestsQuery,
  useGetWritingTestByIdQuery,
  useGetWritingTestByPartQuery,
} = writingTestApi;
