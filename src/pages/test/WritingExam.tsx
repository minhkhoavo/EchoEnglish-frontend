import React, { useState, useEffect } from 'react';
import { formatMs } from '@/features/tests/utils/formatMs';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WritingQuestion } from '@/features/tests/components/speak-write/writing/WritingQuestion';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useGetWritingTestByIdQuery } from '@/features/tests/services/writingTestApi';
import type { WritingPart as WritingPartType } from '@/features/tests/types/writing-test.types';
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestPartSidebar } from '@/features/tests/components/speak-write/TestPartSidebar';

const WritingExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [totalTime] = useState(60 * 60); // 60 minutes
  const [timeRemaining, setTimeRemaining] = useState(totalTime);

  // API call to get test data
  const {
    data: testData,
    error,
    isLoading,
  } = useGetWritingTestByIdQuery(testId!);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate total questions and absolute question numbers
  const getTotalQuestions = () => {
    if (!testData) return 0;
    return testData.parts.reduce(
      (total, part) => total + part.questions.length,
      0
    );
  };

  const getAbsoluteQuestionNumber = (
    partIndex: number,
    questionIndex: number
  ) => {
    if (!testData) return 1;
    let totalQuestions = 0;
    for (let i = 0; i < partIndex; i++) {
      totalQuestions += testData.parts[i].questions.length;
    }
    return totalQuestions + questionIndex + 1;
  };

  const handleAnswer = (
    questionNumber: number,
    answer: string | Record<string, string>
  ) => {
    if (typeof answer === 'string') {
      setAnswers((prev) => new Map(prev.set(questionNumber, answer)));
    } else {
      // Nếu answer là object, lưu dạng JSON string hoặc xử lý theo yêu cầu
      setAnswers(
        (prev) => new Map(prev.set(questionNumber, JSON.stringify(answer)))
      );
    }
  };

  const handleSubmit = () => {
    // Handle test submission
    console.log('Writing test submitted:', answers);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading writing test...</span>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Unable to load writing test. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalQuestions = getTotalQuestions();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 xl:gap-4 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-1 xl:gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg xl:text-2xl font-bold text-foreground truncate">
                {testData.testTitle}
              </h1>
              <p className="text-xs xl:text-sm text-muted-foreground">
                Writing Test - 60 minutes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
            <div className="flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono">
              <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
              <span>{formatMs(timeRemaining * 1000)}</span>
            </div>
            <Button
              onClick={handleSubmit}
              variant="default"
              size="sm"
              className="xl:text-base"
            >
              <span className="hidden sm:inline">Submit Test</span>
              <span className="sm:hidden">Submit</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 xl:gap-8 min-h-[calc(100vh-140px)]">
          {/* Main Content - Wider area */}
          <div className="xl:col-span-4">
            <div
              className="h-[calc(100vh-105px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2 xl:pr-4 scroll-smooth bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
              data-testid="main-scroll-container"
            >
              <div className="p-4 xl:p-6">
                {/* Current Part Content */}
                {testData.parts[currentPartIndex] && (
                  <div className="w-full">
                    {/* Part Instructions */}
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">
                        {testData.parts[currentPartIndex].title}
                      </h3>
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html:
                            testData.parts[currentPartIndex].direction.text,
                        }}
                      />

                      {/* Narrator section if available */}
                      {testData.parts[currentPartIndex].narrator && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <h4 className="font-medium mb-2">Scenario:</h4>
                          {testData.parts[currentPartIndex].narrator.text && (
                            <p className="text-sm mb-2">
                              {testData.parts[currentPartIndex].narrator.text}
                            </p>
                          )}
                          {testData.parts[currentPartIndex].narrator.audio && (
                            <AudioPlayer
                              audioUrl={
                                testData.parts[currentPartIndex].narrator.audio
                              }
                              className="mt-2"
                            />
                          )}
                          {testData.parts[currentPartIndex].narrator.image && (
                            <div className="mt-2">
                              <img
                                src={
                                  testData.parts[currentPartIndex].narrator
                                    .image
                                }
                                alt="Scenario image"
                                className="max-w-full h-auto rounded border"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Display All Questions in this Part */}
                    <div className="space-y-6">
                      {testData.parts[currentPartIndex].questions.map(
                        (question, qIndex) => (
                          <WritingQuestion
                            key={qIndex}
                            question={question}
                            part={testData.parts[currentPartIndex]}
                            partTitle={testData.parts[currentPartIndex].title}
                            questionIndex={qIndex}
                            totalQuestions={
                              testData.parts[currentPartIndex].questions.length
                            }
                            absoluteQuestionNumber={getAbsoluteQuestionNumber(
                              currentPartIndex,
                              qIndex
                            )}
                            onAnswer={handleAnswer}
                            isReviewMode={false}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom padding for smooth scrolling */}
              <div className="h-16"></div>
            </div>
          </div>

          {/* Question Navigation - Sidebar */}
          <div className="xl:col-span-1 order-first xl:order-last">
            <TestPartSidebar
              parts={testData.parts}
              currentPartIndex={currentPartIndex}
              setCurrentPartIndex={setCurrentPartIndex}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingExam;
