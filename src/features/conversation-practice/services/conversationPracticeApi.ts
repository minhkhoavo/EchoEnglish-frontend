import { api } from '../../../core/api/api';
import type {
  ApiResponse,
  ConversationCategory,
  StartConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '../types';

export const conversationPracticeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all topics grouped by categories
    getConversationTopics: builder.query<ConversationCategory[], void>({
      query: () => ({
        url: '/conversation-practice/topics',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<ConversationCategory[]>) =>
        response.data,
      providesTags: ['ConversationPractice'],
    }),

    // Start a conversation with a specific topic
    startConversation: builder.mutation<StartConversationResponse, string>({
      query: (topicId: string) => ({
        url: '/conversation-practice/start',
        method: 'POST',
        data: { topicId },
      }),
      transformResponse: (response: ApiResponse<StartConversationResponse>) =>
        response.data,
    }),

    // Send a message in the conversation
    sendConversationMessage: builder.mutation<
      SendMessageResponse,
      SendMessageRequest
    >({
      query: (body: SendMessageRequest) => ({
        url: '/conversation-practice/message',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: ApiResponse<SendMessageResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useGetConversationTopicsQuery,
  useStartConversationMutation,
  useSendConversationMessageMutation,
} = conversationPracticeApi;
