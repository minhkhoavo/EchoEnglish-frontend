import { api } from '../../../core/api/api';
import type { ChatbotResponse } from '../types';

interface ChatRequest {
  prompt: string;
  image?: File | string; // File object or base64 string
}

interface ChatRequestFormData {
  prompt: string;
  image?: File;
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
    runChatWithImage: builder.mutation<ChatbotResponse, ChatRequestFormData>({
      query: (body: ChatRequestFormData) => {
        const formData = new FormData();
        formData.append('prompt', body.prompt);
        if (body.image) {
          formData.append('image', body.image);
        }

        return {
          url: '/chat/run',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),
  }),
});

export const { useRunChatMutation, useRunChatWithImageMutation } = chatbotApi;
