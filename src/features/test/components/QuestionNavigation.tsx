import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TestData {
  testId: string;
  testTitle: string;
  resultId: string;
  parts: {
    part1?: {
      partName: string;
      partId: string;
      questions: Array<{
        questionNumber: number;
        questionText: string | null;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
        media: {
          audioUrl: string;
          imageUrls?: string[];
          transcript: string;
          translation?: string;
        };
      }>;
    };
    part2?: {
      partName: string;
      partId: string;
      questions: Array<{
        questionNumber: number;
        questionText: string | null;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
        media: {
          audioUrl: string;
          transcript: string;
          translation?: string;
        };
      }>;
    };
    part3?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: string;
          transcript: string;
          translation: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: string;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
    part4?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: string;
          transcript: string;
          translation: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: string;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
    part5?: unknown;
    part6?: unknown;
    part7?: unknown;
  };
}

interface QuestionNavigationProps {
  currentQuestion: number;
  onQuestionSelect: (questionNumber: number) => void;
  testData: TestData;
}

export const QuestionNavigation = ({
  currentQuestion,
  onQuestionSelect,
  testData,
}: QuestionNavigationProps) => {
  // Scroll to question function
  const scrollToQuestion = (questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    if (element) {
      // Get the scrollable container
      const scrollContainer =
        element.closest('[data-testid="main-scroll-container"]') ||
        document.querySelector('.overflow-y-auto') ||
        window;

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
    // Also call the parent's onQuestionSelect to update current question
    onQuestionSelect(questionNumber);
  };

  // Generate question status for all 200 questions
  const getQuestionStatus = (questionNum: number) => {
    // Mock user answers for demonstration
    const mockAnswers = {
      1: { userAnswer: 'A', correctAnswer: 'A' },
      2: { userAnswer: 'C', correctAnswer: 'B' },
      3: { userAnswer: 'B', correctAnswer: 'B' },
      4: { userAnswer: 'D', correctAnswer: 'D' },
      5: { userAnswer: 'C', correctAnswer: 'C' },
      6: { userAnswer: 'C', correctAnswer: 'C' },
      7: { userAnswer: 'C', correctAnswer: 'B' },
      8: { userAnswer: 'C', correctAnswer: 'C' },
      9: { userAnswer: 'C', correctAnswer: 'C' },
      10: { userAnswer: 'A', correctAnswer: 'A' },
      11: { userAnswer: 'C', correctAnswer: 'C' },
      12: { userAnswer: 'C', correctAnswer: 'C' },
      32: { userAnswer: 'D', correctAnswer: 'D' },
      33: { userAnswer: 'B', correctAnswer: 'B' },
      34: { userAnswer: 'B', correctAnswer: 'B' },
      71: { userAnswer: 'B', correctAnswer: 'D' },
      72: { userAnswer: 'A', correctAnswer: 'A' },
      73: { userAnswer: 'C', correctAnswer: 'C' },
    };

    const answer = mockAnswers[questionNum as keyof typeof mockAnswers];
    if (!answer) return 'unanswered';

    return answer.userAnswer === answer.correctAnswer ? 'correct' : 'incorrect';
  };

  const getButtonVariant = (questionNum: number) => {
    const status = getQuestionStatus(questionNum);
    if (questionNum === currentQuestion) return 'default';

    switch (status) {
      case 'correct':
        return 'secondary';
      case 'incorrect':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getButtonClassName = (questionNum: number) => {
    const status = getQuestionStatus(questionNum);
    const baseClass = 'w-8 h-8 text-xs';
    switch (status) {
      case 'correct':
        return cn(
          baseClass,
          'bg-green-500 hover:bg-green-600 text-white border-green-500'
        );
      case 'incorrect':
        return cn(
          baseClass,
          'bg-red-500 hover:bg-red-600 text-white border-red-500'
        );
      default:
        return cn(
          baseClass,
          'bg-muted hover:bg-muted-foreground/10 text-black'
        );
    }
  };

  const parts = [
    { name: 'Part 1', start: 1, end: 6 },
    { name: 'Part 2', start: 7, end: 31 },
    { name: 'Part 3', start: 32, end: 70 },
    { name: 'Part 4', start: 71, end: 100 },
    { name: 'Part 5', start: 101, end: 130 },
    { name: 'Part 6', start: 131, end: 146 },
    { name: 'Part 7', start: 147, end: 200 },
  ];

  return (
    <div
      className="bg-card border rounded-lg p-4 shadow-md flex flex-col"
      style={{ height: 'calc(100vh - 120px)' }}
    >
      <h3 className="font-semibold mb-4 text-card-foreground">Question List</h3>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full scrollbar-thin" type="always">
          <div className="space-y-4 pr-3">
            {parts.map((part) => (
              <div key={part.name}>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  {part.name}
                </h4>
                <div className="grid grid-cols-5 gap-1 mb-4">
                  {Array.from({ length: part.end - part.start + 1 }, (_, i) => {
                    const questionNum = part.start + i;
                    return (
                      <Button
                        key={questionNum}
                        variant={getButtonVariant(questionNum)}
                        className={getButtonClassName(questionNum)}
                        onClick={() => scrollToQuestion(questionNum)}
                      >
                        {questionNum}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* Legend - Fixed at bottom */}
      <div className="mt-4 pt-4 border-t space-y-2 text-xs flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded flex-shrink-0"></div>
          <span className="text-muted-foreground">Correct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded flex-shrink-0"></div>
          <span className="text-muted-foreground">Incorrect</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted border rounded flex-shrink-0"></div>
          <span className="text-muted-foreground">Unanswered</span>
        </div>
      </div>
    </div>
  );
};
