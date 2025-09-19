import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TOEICTestDetail } from '@/features/tests/types/toeic-test.types';

interface QuestionNavigationProps {
  currentQuestion: number;
  onQuestionSelect: (questionNumber: number) => void;
  testData: TOEICTestDetail;
  showParts?: string[];
  isHistoryView?: boolean;
  userAnswers?: { [questionNumber: number]: string }; // User answers from current session or review
  reviewAnswers?: Array<{
    // Detailed review answers with correct/incorrect info
    questionNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }>;
}

export const QuestionNavigation = ({
  currentQuestion,
  onQuestionSelect,
  testData,
  showParts = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7'],
  isHistoryView = false,
  userAnswers = {},
  reviewAnswers = [],
}: QuestionNavigationProps) => {
  // Scroll to question function
  const scrollToQuestion = (questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    if (element) {
      // Scroll smoothly to the selected question element
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
    // For history/review view, show correct/incorrect/unanswered
    if (isHistoryView) {
      // Use real review data if available
      if (reviewAnswers && reviewAnswers.length > 0) {
        const answerData = reviewAnswers.find(
          (ans) => ans.questionNumber === questionNum
        );
        if (answerData) {
          return answerData.isCorrect ? 'correct' : 'incorrect';
        }
        return 'unanswered';
      }
      // No mock data fallback - use unanswered if no real data
      return 'unanswered';
    }

    // For current test, just check if user has answered
    return userAnswers[questionNum] ? 'answered' : 'unanswered';
  };

  const getButtonVariant = (questionNum: number) => {
    const status = getQuestionStatus(questionNum);

    switch (status) {
      case 'correct':
        return 'secondary';
      case 'incorrect':
        return 'destructive';
      case 'answered':
        return 'default'; // Blue background for answered questions in current test
      default:
        return 'outline';
    }
  };

  const getButtonClassName = (questionNum: number) => {
    const status = getQuestionStatus(questionNum);
    const baseClass = 'w-8 h-8 ml-1 text-xs hover:ring-2 hover:ring-blue-300';

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
      case 'answered':
        return cn(
          baseClass,
          'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
        );
      default:
        return cn(baseClass, 'hover:bg-muted-foreground/10 text-black');
    }
  };

  const parts = [
    { name: 'Part 1', start: 1, end: 6, id: 'part1' },
    { name: 'Part 2', start: 7, end: 31, id: 'part2' },
    { name: 'Part 3', start: 32, end: 70, id: 'part3' },
    { name: 'Part 4', start: 71, end: 100, id: 'part4' },
    { name: 'Part 5', start: 101, end: 130, id: 'part5' },
    { name: 'Part 6', start: 131, end: 146, id: 'part6' },
    { name: 'Part 7', start: 147, end: 200, id: 'part7' },
  ].filter((part) => showParts.includes(part.id));

  return (
    <div
      className="bg-card border rounded-lg p-2 shadow-md flex flex-col"
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
        {isHistoryView ? (
          <>
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
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded flex-shrink-0"></div>
              <span className="text-muted-foreground">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted border rounded flex-shrink-0"></div>
              <span className="text-muted-foreground">Unanswered</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
