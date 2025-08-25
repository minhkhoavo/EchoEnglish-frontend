import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  setActiveQuiz,
  setTimeLeft,
  setReviewMode,
  type QuizQuestion,
  setShowResults,
} from './slices/quizSlice';
import { useGetQuizByIdQuery, useGenerateQuizMutation, useSubmitQuizAnswersMutation } from './services/quizApi';
import { QuizHeader } from './components/QuizHeader';
import { QuizQuestionDisplay } from './components/QuizQuestionDisplay';
import { QuizOptions } from './components/QuizOptions';
import { QuizNavigation } from './components/QuizNavigation';
import { QuizResults } from './components/QuizResults';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QuizInterfaceProps {
  onClose: () => void;
  fileId?: string; 
}

export const QuizInterface = ({ onClose, fileId }: QuizInterfaceProps) => {
  const dispatch = useAppDispatch();
  const {
    activeQuiz,
    currentQuestionIndex,
    selectedAnswers,
    showResults,
    timeLeft,
    isReviewMode,
    reviewQuestionIndex,
  } = useAppSelector((state) => state.quiz);

  const [triggerGenerateQuiz, { data: generatedQuiz, isLoading: isGeneratingQuiz, isError: isGenerateError }] = useGenerateQuizMutation();
  const { data: fetchedQuiz, isLoading: isFetchingQuiz, isError: isFetchError } = useGetQuizByIdQuery({ fileId });
  const [submitAnswers] = useSubmitQuizAnswersMutation();
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (fileId) {
      triggerGenerateQuiz({ fileId });
    }
  }, [fileId, triggerGenerateQuiz]);

  useEffect(() => {
    if (generatedQuiz) {
      dispatch(setActiveQuiz(generatedQuiz));
    } else if (fetchedQuiz) {
      dispatch(setActiveQuiz(fetchedQuiz));
    }
  }, [generatedQuiz, fetchedQuiz, dispatch]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !showResults && activeQuiz && !isReviewMode) {
      const timer = setTimeout(() => dispatch(setTimeLeft(timeLeft - 1)), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && activeQuiz && !showResults && !isReviewMode) {
      dispatch(setTimeLeft(0));
      handleSubmitQuiz();
    }
  }, [timeLeft, showResults, isReviewMode, dispatch]);

  const handleSubmitQuiz = async () => {
    if (activeQuiz) {
      try {
        const result = await submitAnswers({ quizId: activeQuiz.id, answers: selectedAnswers }).unwrap();
        console.log("result:::::::" + result)
        setScore(result.score);
        setTotalQuestions(result.total);
        dispatch(setActiveQuiz({ ...activeQuiz, questions: activeQuiz.questions })); // Keep quiz data for results display
        dispatch(setTimeLeft(0));
        dispatch(setShowResults(true));
      } catch (error) {
        console.error("Failed to submit quiz:", error);
        dispatch(setActiveQuiz(null));
        dispatch(setTimeLeft(0));
      }
    }
  };

  const handleExitReviewMode = () => {
    dispatch(setReviewMode({ isReviewMode: false, reviewQuestionIndex: null }));
  };

  const isLoading = isGeneratingQuiz || isFetchingQuiz;
  const isError = isGenerateError || isFetchError;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <p>Loading Quiz...</p>
      </div>
    );
  }

  if (isError || !activeQuiz) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardTitle>Error Loading Quiz</CardTitle>
          <CardContent>
            <p className="text-muted-foreground mt-2">Could not load the quiz. Please try again later.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ: QuizQuestion | undefined = isReviewMode && reviewQuestionIndex !== null
    ? activeQuiz.questions[reviewQuestionIndex]
    : activeQuiz.questions[currentQuestionIndex];

  if (!currentQ) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <Card className="p-6 text-center">
          <CardTitle>No Questions Found</CardTitle>
          <CardContent>
            <p className="text-muted-foreground mt-2">This quiz does not contain any questions.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && !isReviewMode) {
    return (
      <QuizResults 
        onClose={onClose} 
        score={score} 
        totalQuestions={totalQuestions} 
        activeQuiz={activeQuiz} 
      />
    );
  }

  if (isReviewMode && reviewQuestionIndex !== null) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 max-w-4xl max-h-screen overflow-y-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Review Question {reviewQuestionIndex + 1}</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleExitReviewMode}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <QuizQuestionDisplay currentQ={currentQ} isReviewMode={true} />
              <QuizOptions 
                currentQ={currentQ} 
                isReviewMode={true} 
                selectedAnswerId={selectedAnswers[currentQ.id]} 
                correctAnswerId={currentQ.correctAnswer} 
              />
              <Button onClick={handleExitReviewMode} className="w-full">Back to Results</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 max-w-4xl max-h-screen overflow-y-auto">
        <Card>
          <QuizHeader onClose={onClose} />
          <CardContent className="space-y-6">
            <QuizQuestionDisplay currentQ={currentQ} />
            <QuizOptions currentQ={currentQ} />
            <QuizNavigation onSubmitQuiz={handleSubmitQuiz} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
