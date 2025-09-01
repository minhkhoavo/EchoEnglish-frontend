import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Quiz, QuizQuestionBuilder } from '../slices/quizSlice';

const mockQuiz: Quiz = {
  id: 'toeic-sample-1',
  title: 'TOEIC Listening & Reading Practice',
  description: 'A comprehensive practice quiz covering listening and reading skills',
  totalTime: 10, // 10 second
  questions: [
    {
      id: 'q1',
      type: 'listening',
      question: {
        text: 'Listen to the conversation and choose the best answer.',
        audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      options: [
        { id: 'a', text: 'She will attend the meeting tomorrow.' },
        { id: 'b', text: 'She cannot make it to the conference.' },
        { id: 'c', text: 'She needs to reschedule the appointment.' },
        { id: 'd', text: 'She will call back later today.' }
      ],
      correctAnswer: 'c',
      explanation: {
        text: 'The speaker mentions needing to reschedule due to a conflict.',
        audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      timeLimit: 30
    },
    {
      id: 'q2',
      type: 'reading',
      question: {
        text: 'Read the following notice and answer the question.',
        image: 'https://images.ctfassets.net/hrltx12pl8hq/01rJn4TormMsGQs1ZRIpzX/16a1cae2440420d0fd0a7a9a006f2dcb/Artboard_Copy_231.jpg'
      },
      options: [
        { id: 'a', text: 'Monday to Friday, 9 AM - 5 PM' },
        { id: 'b', text: 'Monday to Saturday, 8 AM - 6 PM' },
        { id: 'c', text: 'Tuesday to Sunday, 10 AM - 4 PM' },
        { id: 'd', text: 'Daily, 24 hours' }
      ],
      correctAnswer: 'a',
      explanation: {
        text: 'The notice clearly states the office hours as Monday through Friday, 9 AM to 5 PM.'
      },
      timeLimit: 45
    },
    {
      id: 'q3',
      type: 'vocabulary',
      question: {
        text: 'Choose the word that best completes the sentence:',
        imageGroup: [
          'https://via.placeholder.com/150x100/10b981/ffffff?text=Image+1',
          'https://via.placeholder.com/150x100/f59e0b/ffffff?text=Image+2',
          'https://via.placeholder.com/150x100/ef4444/ffffff?text=Image+3',
          'https://via.placeholder.com/150x100/8b5cf6/ffffff?text=Image+4'
        ]
      },
      options: [
        { 
          id: 'a', 
          text: 'Collaborate',
          image: 'https://via.placeholder.com/100x60/10b981/ffffff?text=A'
        },
        { 
          id: 'b', 
          text: 'Procrastinate',
          image: 'https://via.placeholder.com/100x60/f59e0b/ffffff?text=B'
        },
        { 
          id: 'c', 
          text: 'Negotiate',
          image: 'https://via.placeholder.com/100x60/ef4444/ffffff?text=C'
        },
        { 
          id: 'd', 
          text: 'Demonstrate',
          image: 'https://via.placeholder.com/100x60/8b5cf6/ffffff?text=D'
        }
      ],
      correctAnswer: 'a',
      explanation: {
        text: 'Collaborate means to work together, which fits the business context shown in the images.'
      },
      timeLimit: 30
    },
    {
      id: 'q4',
      type: 'listening',
      question: {
        text: 'Listen to the audio and identify the speaker\'s main concern.',
        audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      options: [
        { 
          id: 'a', 
          text: 'Budget constraints',
          audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        { 
          id: 'b', 
          text: 'Time management',
          audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        { 
          id: 'c', 
          text: 'Staff shortage',
          audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        },
        { 
          id: 'd', 
          text: 'Technical issues',
          image: 'https://via.placeholder.com/100x60/8b5cf6/ffffff?text=D',
          audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
        }
      ],
      correctAnswer: 'b',
      explanation: {
        text: 'The speaker emphasizes the importance of meeting deadlines and efficient scheduling.',
        audio: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      timeLimit: 40
    }
  ]
};

export const quizApi = createApi({
  reducerPath: 'quizApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  endpoints: (builder) => ({
    getQuizById: builder.query<Quiz, { fileId?: string }>({
      queryFn: async ({ fileId }) => {
        try {
          const formData = new FormData();
          formData.append("part", "6"); 
          formData.append("user_id", "88"); 
          if (fileId) {
            formData.append("file_ids", fileId);
          }

          const response = await fetch("http://localhost:8001/api/v1/generate/quiz/", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            return { error: { status: response.status, data: await response.text() } };
          }

          const data: Quiz = await response.json();
          return { ...data, totalTime: 15 };
        } catch (error: unknown) {
          return { error: { status: "FETCH_ERROR", error: (error as Error)?.message || "Unknown error" } };
        }
      },
    }),
    generateQuiz: builder.mutation<Quiz, { fileId?: string }>({
      queryFn: async ({ fileId }) => {
        try {
          const formData = new FormData();
          formData.append("part", "6"); // Default part as per instruction
          formData.append("user_id", "88"); // Default user_id as per instruction
          if (fileId) {
            formData.append("file_ids", fileId);
          }

          const response = await fetch("http://localhost:8001/api/v1/generate/quiz/", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            return { error: { status: response.status, data: await response.text() } };
          }

          const data: Quiz = await response.json();
return { 
  data: {
    ...data,
    totalTime: 15,
    id: 'toeic-sample-1',
    title: 'TOEIC Listening & Reading Practice',
    description: 'A comprehensive practice quiz covering listening and reading skills',
  }
};


        } catch (error: unknown) {
          return { error: { status: "FETCH_ERROR", error: (error as Error)?.message || "Unknown error" } };
        }
      },
    }),
    createQuiz: builder.mutation<Quiz, QuizQuestionBuilder[]>({
      queryFn: (questions) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newQuiz: Quiz = {
              id: `new-quiz-${Date.now()}`,
              title: 'Generated Quiz',
              description: 'Quiz created from builder',
              totalTime: 600,
              questions: questions.map((q, index) => ({
                id: `gen-q${index + 1}`,
                type: 'multiple-choice', 
                question: { text: q.question },
                options: q.options.map((opt, i) => ({ id: String.fromCharCode(97 + i), text: opt })),
                correctAnswer: String.fromCharCode(97 + q.correctAnswer),
                explanation: q.explanation ? { text: q.explanation } : undefined,
              })),
            };
            resolve({ data: newQuiz });
          }, 500);
        });
      },
    }),
    submitQuizAnswers: builder.mutation<
      { score: number; total: number },
      { quizId: string; answers: Record<string, string> }
    >({
      queryFn: ({ quizId, answers }) => {
        return new Promise((resolve) => {
          setTimeout(() => {
              const result = { score: 99, total: mockQuiz.questions.length };
              resolve({ data: result });

            // if (quizId === mockQuiz.id) {
            //   let correct = 0;
            //   mockQuiz.questions.forEach(q => {
            //     if (answers[q.id] === q.correctAnswer) correct++;
            //   });

            //   const result = { score: correct, total: mockQuiz.questions.length };
            //   resolve({ data: result });
            // } else {
            //   console.error("Quiz not found for submission:", quizId);
            //   resolve({ error: { status: 404, data: 'Quiz not found' } });
            // }
          }, 500);
        });
      },
    }),
  }),
});

export const { useGetQuizByIdQuery, useGenerateQuizMutation, useCreateQuizMutation, useSubmitQuizAnswersMutation } = quizApi;
