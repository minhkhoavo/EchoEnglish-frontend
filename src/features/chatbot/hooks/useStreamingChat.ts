// useStreamingChat.ts - Hook for streaming chat with SSE
import { useState, useCallback, useRef } from 'react';
import type { ChatbotResponse } from '../types';

interface StreamingState {
  isStreaming: boolean;
  isThinking: boolean;
  streamedText: string;
  response: ChatbotResponse | null;
  error: string | null;
}

interface UseStreamingChatOptions {
  onChunk?: (text: string) => void;
  onComplete?: (response: ChatbotResponse) => void;
  onError?: (error: string) => void;
}

export const useStreamingChat = (options?: UseStreamingChatOptions) => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isThinking: false,
    streamedText: '',
    response: null,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendStreamingMessage = useCallback(
    async (prompt: string, image?: File) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState({
        isStreaming: true,
        isThinking: true,
        streamedText: '',
        response: null,
        error: null,
      });

      try {
        const token = localStorage.getItem('accessToken');

        // Prepare form data if image is provided
        let body: BodyInit;
        const headers: HeadersInit = {};

        if (image) {
          const formData = new FormData();
          formData.append('prompt', prompt);
          formData.append('image', image);
          body = formData;
        } else {
          body = JSON.stringify({ prompt });
          headers['Content-Type'] = 'application/json';
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/chat/stream`,
          {
            method: 'POST',
            headers,
            body,
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7).trim();

              // Get the next line for data
              const dataLineIndex = lines.indexOf(line) + 1;
              if (
                dataLineIndex < lines.length &&
                lines[dataLineIndex].startsWith('data: ')
              ) {
                const dataStr = lines[dataLineIndex].slice(6);
                try {
                  const data = JSON.parse(dataStr);

                  switch (eventType) {
                    case 'thinking':
                      setState((prev) => ({ ...prev, isThinking: true }));
                      break;

                    case 'chunk':
                      accumulatedText += data.text || '';
                      setState((prev) => ({
                        ...prev,
                        isThinking: false,
                        streamedText: accumulatedText,
                      }));
                      options?.onChunk?.(accumulatedText);
                      break;

                    case 'complete':
                      setState((prev) => ({
                        ...prev,
                        response: data as ChatbotResponse,
                      }));
                      options?.onComplete?.(data as ChatbotResponse);
                      break;

                    case 'done':
                      setState((prev) => ({
                        ...prev,
                        isStreaming: false,
                        isThinking: false,
                      }));
                      break;

                    case 'error':
                      setState((prev) => ({
                        ...prev,
                        isStreaming: false,
                        isThinking: false,
                        error: data.message || 'Unknown error',
                      }));
                      options?.onError?.(data.message || 'Unknown error');
                      break;
                  }
                } catch {
                  // Ignore JSON parse errors for incomplete data
                }
              }
            } else if (line.startsWith('data: ')) {
              // Handle data without preceding event line
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  accumulatedText += data.text;
                  setState((prev) => ({
                    ...prev,
                    isThinking: false,
                    streamedText: accumulatedText,
                  }));
                  options?.onChunk?.(accumulatedText);
                }
              } catch {
                // Ignore
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to send message';
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            isThinking: false,
            error: errorMessage,
          }));
          options?.onError?.(errorMessage);
        }
      }
    },
    [options]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        isThinking: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      isThinking: false,
      streamedText: '',
      response: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    sendStreamingMessage,
    cancelStream,
    reset,
  };
};

export default useStreamingChat;
