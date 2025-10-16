import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import type { PracticeDrillData } from '../types/practice-drill.types';
import { transformPracticeDrillData } from '../utils/practiceDrillTransform';
import { PracticeDrillProvider } from '../contexts/PracticeDrillContext';
import { useFetchQuestionsByIdsQuery } from '../services/practiceDrillApi';

// Import existing Part components - NO NEED TO CREATE NEW ONES!
import { Part1Question } from '../../tests/components/lis-read/questions/Part1Question';
import { Part2Question } from '../../tests/components/lis-read/questions/Part2Question';
import { Part3Question } from '../../tests/components/lis-read/questions/Part3Question';
import { Part4Question } from '../../tests/components/lis-read/questions/Part4Question';
import { Part5Question } from '../../tests/components/lis-read/questions/Part5Question';
import { Part6Question } from '../../tests/components/lis-read/questions/Part6Question';
import { Part7Question } from '../../tests/components/lis-read/questions/Part7Question';

interface PracticeDrillViewerProps {
  questionIds?: string[];
  data?: PracticeDrillData;
  onSubmit?: (answers: Record<number, string>) => void;
}

export const PracticeDrillViewer = ({
  questionIds,
  data: providedData,
  onSubmit,
}: PracticeDrillViewerProps) => {
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Fetch questions by IDs if questionIds provided
  const {
    data: fetchedData,
    isLoading,
    error,
  } = useFetchQuestionsByIdsQuery(questionIds || [], {
    skip: !questionIds || questionIds.length === 0,
  });

  // Use either fetched data or provided data
  const data = fetchedData || providedData;

  // Transform backend data to TestPart format
  const transformedParts = useMemo(
    () => (data ? transformPracticeDrillData(data) : []),
    [data]
  );

  const currentPart = transformedParts[currentPartIndex];

  // Get all questions for progress tracking
  const allQuestions = useMemo(() => {
    if (!data) return [];
    return data.parts.flatMap((part) => {
      if (part.questions) return part.questions;
      if (part.questionGroups)
        return part.questionGroups.flatMap((g) => g.questions);
      return [];
    });
  }, [data]);

  const totalQuestions = allQuestions.length;
  const answeredQuestions = Object.keys(userAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Mock functions for Part components that expect useTestSession
  const saveAnswer = (questionNumber: number, answer: string) => {
    if (!isSubmitted) {
      setUserAnswers((prev) => ({
        ...prev,
        [questionNumber]: answer,
      }));
    }
  };

  const getAnswer = (questionNumber: number): string | null => {
    return userAnswers[questionNumber] || null;
  };

  const contextValue = useMemo(
    () => ({
      saveAnswer,
      getAnswer,
      isSubmitted,
    }),
    [userAnswers, isSubmitted]
  );

  const nextPart = () => {
    if (currentPartIndex < transformedParts.length - 1) {
      setCurrentPartIndex(currentPartIndex + 1);
    }
  };

  const prevPart = () => {
    if (currentPartIndex > 0) {
      setCurrentPartIndex(currentPartIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);

    // Calculate results
    const results = allQuestions.map((q) => {
      const userAnswer = userAnswers[q.questionNumber];
      return {
        questionNumber: q.questionNumber,
        userAnswer: userAnswer || 'Not answered',
        correctAnswer: q.correctAnswer,
        isCorrect: userAnswer === q.correctAnswer,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = ((correctCount / totalQuestions) * 100).toFixed(1);

    // Console log results
    console.log('=== PRACTICE DRILL RESULTS ===');
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Answered: ${answeredQuestions}`);
    console.log(`Correct: ${correctCount}`);
    console.log(`Score: ${score}%`);
    console.log('\n=== DETAILED RESULTS ===');
    results.forEach((r) => {
      console.log(
        `Question ${r.questionNumber}: ${r.isCorrect ? '✅' : '❌'} | Your answer: ${r.userAnswer} | Correct: ${r.correctAnswer}`
      );
    });

    // Call parent callback if provided
    onSubmit?.(userAnswers);
  };

  const handleReset = () => {
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentPartIndex(0);
  };

  // Render appropriate Part component based on part name
  const renderPartContent = () => {
    const partName = currentPart.partName.toLowerCase();

    const commonProps = {
      part: currentPart,
      showCorrectAnswers: isSubmitted,
      userAnswers: userAnswers,
    };

    // Map part name to component
    if (partName.includes('part 1')) return <Part1Question {...commonProps} />;
    if (partName.includes('part 2')) return <Part2Question {...commonProps} />;
    if (partName.includes('part 3')) return <Part3Question {...commonProps} />;
    if (partName.includes('part 4')) return <Part4Question {...commonProps} />;
    if (partName.includes('part 5')) return <Part5Question {...commonProps} />;
    if (partName.includes('part 6')) return <Part6Question {...commonProps} />;
    if (partName.includes('part 7')) return <Part7Question {...commonProps} />;

    // Fallback
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Part {currentPart.partName} is not yet supported.
        </p>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">
              Error loading data
            </p>
            <p className="text-gray-600 text-sm">
              Unable to load questions. Please try again later.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Show no data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Card className="p-8">
          <p className="text-gray-600">No question data available.</p>
        </Card>
      </div>
    );
  }

  return (
    <PracticeDrillProvider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Compact Header */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Title and Info */}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {data.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    {totalQuestions} questions • {data.parts.length} parts
                  </span>
                  {!isSubmitted && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {answeredQuestions}/{totalQuestions}
                        </span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {isSubmitted && (
                  <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Submitted
                  </Badge>
                )}

                {!isSubmitted ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={answeredQuestions === 0}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Submit
                  </Button>
                ) : (
                  <Button onClick={handleReset} variant="outline" size="sm">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Bar */}
          <Card className="mb-4 shadow-sm border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-4">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  onClick={prevPart}
                  disabled={currentPartIndex === 0}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                {/* Part Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2 flex-1">
                  {data.parts.map((part, index) => {
                    const partQuestions =
                      part.questions ||
                      part.questionGroups?.flatMap((g) => g.questions) ||
                      [];
                    const partAnswered = partQuestions.filter(
                      (q) => userAnswers[q.questionNumber]
                    ).length;
                    const isComplete = partAnswered === partQuestions.length;

                    return (
                      <Badge
                        key={index}
                        variant={
                          index === currentPartIndex ? 'default' : 'outline'
                        }
                        className={`cursor-pointer transition-all text-xs ${
                          index === currentPartIndex
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'hover:bg-blue-50'
                        } ${
                          isComplete && !isSubmitted
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : ''
                        }`}
                        onClick={() => setCurrentPartIndex(index)}
                      >
                        {part.partName}
                        {isComplete &&
                          !isSubmitted &&
                          partQuestions.length > 0 && (
                            <Check className="w-3 h-3 ml-1" />
                          )}
                      </Badge>
                    );
                  })}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  onClick={nextPart}
                  disabled={currentPartIndex === transformedParts.length - 1}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Part Content */}
          <div className="mb-6">{renderPartContent()}</div>
        </div>
      </div>
    </PracticeDrillProvider>
  );
};
