import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { nextQuestion, previousQuestion } from '../slices/quizSlice';

interface QuizNavigationProps {
  onSubmitQuiz: () => void;
}

export const QuizNavigation = ({ onSubmitQuiz }: QuizNavigationProps) => {
  const dispatch = useAppDispatch();
  const { activeQuiz, currentQuestionIndex, selectedAnswers } = useAppSelector((state) => state.quiz);

  if (!activeQuiz) return null;

  const handleNext = () => {
    dispatch(nextQuestion());
  };

  const handlePrevious = () => {
    dispatch(previousQuestion());
  };

  const handleSubmit = () => {
    onSubmitQuiz();
  };

  return (
    <div className="flex justify-between pt-6 border-t">
      <Button 
        variant="outline" 
        onClick={handlePrevious}
        disabled={currentQuestionIndex === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleSubmit}>
          Submit Quiz
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!selectedAnswers[activeQuiz.questions[currentQuestionIndex].id]}
        >
          {currentQuestionIndex === activeQuiz.questions.length - 1 ? 'Finish' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
