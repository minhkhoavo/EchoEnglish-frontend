import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Flashcard } from '../types/flashcard.types';

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    front: 'What is React?',
    back: 'A JavaScript library for building user interfaces.',
    category: 'Programming',
    difficulty: 'Easy',
    tags: ['React', 'Frontend', 'JavaScript'],
    isAIGenerated: false,
  },
  {
    id: '2',
    front: 'Explain the concept of "props" in React.',
    back: 'Props are arguments passed into React components. Props are passed to components via HTML attributes.',
    category: 'Programming',
    difficulty: 'Medium',
    tags: ['React', 'Props'],
    source: 'React Documentation',
    isAIGenerated: true,
  },
  {
    id: '3',
    front: 'What is the purpose of the `useState` hook?',
    back: '`useState` is a React Hook that lets you add state to function components.',
    category: 'Programming',
    difficulty: 'Easy',
    tags: ['React', 'Hooks', 'State'],
    isAIGenerated: false,
  },
  {
    id: '4',
    front: 'Describe the virtual DOM.',
    back: 'The virtual DOM (VDOM) is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory and synced with the "real" DOM by a library like React DOM.',
    category: 'Programming',
    difficulty: 'Hard',
    tags: ['React', 'DOM', 'Performance'],
    isAIGenerated: true,
  },
];

export const flashcardApi = createApi({
  reducerPath: 'flashcardApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), 
  endpoints: (builder) => ({
    getFlashcards: builder.query<Flashcard[], void>({
      queryFn: () => {
        return { data: mockFlashcards };
      },
    }),
    getFlashcardById: builder.query<Flashcard, string>({
      queryFn: (id: string) => {
        const flashcard = mockFlashcards.find((card) => card.id === id);
        if (flashcard) {
          return { data: flashcard };
        }
        return { error: { status: 404, statusText: 'Not Found', data: 'Flashcard not found' } };
      },
    }),
  }),
});

export const { useGetFlashcardsQuery, useGetFlashcardByIdQuery } = flashcardApi;
