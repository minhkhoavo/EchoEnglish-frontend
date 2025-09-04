import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  selectAnswer,
  type QuizQuestion,
  type QuizOption,
} from '../slices/quizSlice';
import { MediaPlayer } from './MediaPlayer';

interface QuizOptionsProps {
  currentQ: QuizQuestion;
  isReviewMode?: boolean;
  selectedAnswerId?: string;
  correctAnswerId?: string;
}

export const QuizOptions = ({
  currentQ,
  isReviewMode = false,
  selectedAnswerId,
  correctAnswerId,
}: QuizOptionsProps) => {
  const dispatch = useAppDispatch();
  const { selectedAnswers } = useAppSelector((state) => state.quiz);

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (!isReviewMode) {
      dispatch(selectAnswer({ questionId, optionId }));
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Choose your answer:</h4>
      <div className="space-y-3">
        {currentQ.options.map((option: QuizOption) => {
          const isSelected = isReviewMode
            ? option.id === selectedAnswerId
            : selectedAnswers[currentQ.id] === option.id;
          const isCorrect = option.id === correctAnswerId;

          return (
            <div
              key={option.id}
              className={cn(
                'p-4 border rounded-lg transition-all duration-200',
                !isReviewMode && 'cursor-pointer hover:bg-muted/50',
                isSelected &&
                  (isReviewMode && isCorrect
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-primary bg-primary/5'),
                isReviewMode &&
                  isCorrect &&
                  !isSelected &&
                  'border-green-500 bg-green-500/10', // Highlight correct answer if not selected
                isReviewMode &&
                  isSelected &&
                  !isCorrect &&
                  'border-red-500 bg-red-500/10' // Highlight incorrect selected answer
              )}
              onClick={() => handleAnswerSelect(currentQ.id, option.id)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                    isSelected
                      ? isReviewMode && isCorrect
                        ? 'border-green-500 bg-green-500 text-primary-foreground'
                        : 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground',
                    isReviewMode &&
                      isCorrect &&
                      !isSelected &&
                      'border-green-500 bg-green-500 text-primary-foreground'
                  )}
                >
                  {option.id.toUpperCase()}
                </div>

                <div className="flex-1 space-y-2">
                  {option.text && <p className="text-sm">{option.text}</p>}

                  {option.image && (
                    <img
                      src={option.image}
                      alt={`Option ${option.id}`}
                      className="max-w-24 h-auto rounded border"
                    />
                  )}

                  {option.audio && (
                    <MediaPlayer
                      audio={option.audio}
                      audioId={`option-${option.id}`}
                      className="max-w-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
