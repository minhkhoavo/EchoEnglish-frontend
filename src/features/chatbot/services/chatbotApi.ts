import { api } from '../../../core/api/api';
import type { ChatbotResponse } from '../types';

interface ChatRequest {
  prompt: string;
}

export const chatbotApi = api.injectEndpoints({
  endpoints: (builder) => ({
    runChat: builder.mutation<ChatbotResponse, ChatRequest>({
      query: (body: ChatRequest) => ({
        url: '/chat/run',
        method: 'POST',
        data: body,
      }),
    }),
  }),
});

export const { useRunChatMutation } = chatbotApi;
