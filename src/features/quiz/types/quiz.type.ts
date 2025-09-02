export interface QuizQuestionBuilder {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  text?: string;
  image?: string;
  audio?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'listening' | 'reading' | 'vocabulary' | 'grammar' | 'multiple-choice';
  question: {
    text?: string;
    image?: string;
    audio?: string;
    imageGroup?: string[];
  };
  options: QuizOption[];
  correctAnswer: string; 
  explanation?: {
    text?: string;
    audio?: string;
  };
  timeLimit?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalTime: number;
}