import { RotateCcw, CheckCircle2, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  resetQuizInterface,
  setTimeLeft,
  setReviewMode,
} from '../slices/quizSlice';
import type { Quiz } from '../slices/quizSlice';
import { cn } from '@/lib/utils';

interface QuizResultsProps {
  onClose: () => void;
  score: number;
  totalQuestions: number;
  activeQuiz: Quiz;
}

export const QuizResults = ({
  onClose,
  score,
  totalQuestions,
  activeQuiz,
}: QuizResultsProps) => {
  const dispatch = useAppDispatch();
  const { selectedAnswers } = useAppSelector((state) => state.quiz);

  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleRetakeQuiz = () => {
    dispatch(resetQuizInterface());
    dispatch(setTimeLeft(activeQuiz.totalTime));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 max-w-4xl max-h-screen overflow-y-auto">
        <Card className="mx-auto p-6 shadow-lg rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="relative text-center border-b pb-4 mb-6 border-gray-200">
            <div className="flex-1" />
            <CardTitle className="text-3xl font-extrabold text-indigo-800">
              Quiz Results
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                <div className="text-4xl font-bold text-white">
                  {percentage}%
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">
                  {percentage >= 80
                    ? 'Excellent!'
                    : percentage >= 60
                      ? 'Good Job!'
                      : 'Keep Practicing!'}
                </h3>
                <p className="text-lg text-gray-600">
                  You scored{' '}
                  <span className="font-semibold text-indigo-600">{score}</span>{' '}
                  out of{' '}
                  <span className="font-semibold text-indigo-600">
                    {totalQuestions}
                  </span>{' '}
                  questions correctly
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-6 border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800">
                Review Your Answers:
              </h4>
              <div className="grid gap-4">
                {activeQuiz.questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                  const selectedOption = q.options.find(
                    (opt) => opt.id === selectedAnswers[q.id]
                  );

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        'p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200',
                        isCorrect
                          ? 'border-green-300 bg-green-50 hover:bg-green-100'
                          : 'border-red-300 bg-red-50 hover:bg-red-100'
                      )}
                      onClick={() =>
                        dispatch(
                          setReviewMode({
                            isReviewMode: true,
                            reviewQuestionIndex: idx,
                          })
                        )
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">
                          Question {idx + 1}
                        </span>
                        {isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {q.question.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your answer:{' '}
                        <span className="font-semibold">
                          {selectedOption?.text || 'Not answered'}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleRetakeQuiz}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
