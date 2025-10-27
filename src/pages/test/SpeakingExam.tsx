import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeakingQuestion } from '@/features/tests/components/speak-write/speaking/SpeakingQuestion';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useGetSpeakingTestByIdQuery } from '@/features/tests/services/speakingTestApi';
import {
  useFinishSpeakingAttemptMutation,
  useStartSpeakingAttemptMutation,
  type SpeakingAttemptData,
} from '@/features/tests/services/speakingAttemptApi';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  startExam,
  goToQuestion,
  nextQuestion,
  setExamMode,
} from '@/features/tests/slices/speakingExamSlice';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestPartSidebar } from '@/features/tests/components/speak-write/TestPartSidebar';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';

const SpeakingExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { confirm, ConfirmDialog } = useConfirmationDialog();

  // Redux state - controls navigation in exam mode
  const {
    examMode,
    isExamActive,
    currentQuestionIndex,
    currentPartIndex,
    testAttemptId: reduxTestAttemptId,
  } = useAppSelector((state) => state.speakingExam);

  // Local state
  const [localCurrentPartIndex, setLocalCurrentPartIndex] = useState(0);
  const [attemptData, setAttemptData] = useState<SpeakingAttemptData | null>(
    null
  );
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);

  // Fetch test structure
  const {
    data: testData,
    error,
    isLoading,
  } = useGetSpeakingTestByIdQuery(testId!, {
    skip: !testId,
  });

  // Start attempt and get full data
  const [startAttempt] = useStartSpeakingAttemptMutation();

  // Initialize attempt on component mount
  useEffect(() => {
    if (!testId) return;

    const initializeAttempt = async () => {
      try {
        setIsLoadingAttempt(true);
        // Call start - backend will return existing attempt or create new one
        const result = await startAttempt({
          toeicSpeakingTestId: testId,
          examMode: 'normal', // Default mode, can be changed later
        }).unwrap();

        setAttemptData(result);

        // Dispatch to Redux with backend data
        const attemptId = result.testAttemptId || result._id;
        dispatch(
          startExam({
            testAttemptId: attemptId,
          })
        );

        // Update examMode from backend
        dispatch(setExamMode(result.examMode || 'normal'));
      } catch (err) {
        console.error('Failed to initialize attempt:', err);
        toast.error('Failed to load attempt');
      } finally {
        setIsLoadingAttempt(false);
      }
    };

    initializeAttempt();
  }, [testId, startAttempt, dispatch]);

  const testAttemptId =
    attemptData?._id || location.state?.testAttemptId || reduxTestAttemptId;
  console.log('Using testAttemptId:::::::::', testAttemptId);

  const [finishAttempt, { isLoading: isFinishing }] =
    useFinishSpeakingAttemptMutation();

  // Initialize exam mode when attempt data is loaded
  useEffect(() => {
    if (attemptData && !isExamActive) {
      // Get examMode from backend data
      const backendExamMode = attemptData.examMode || 'normal';
      const attemptId = attemptData.testAttemptId || attemptData._id;

      dispatch(
        startExam({
          testAttemptId: attemptId,
        })
      );

      // Update examMode from backend
      dispatch(setExamMode(backendExamMode));

      // Find the first unanswered question (only in exam mode)
      if (backendExamMode === 'exam') {
        let firstUnansweredIndex = 0;

        for (let p = 0; p < attemptData.parts.length; p++) {
          const part = attemptData.parts[p];
          for (let q = 0; q < part.questions.length; q++) {
            const question = part.questions[q];
            if (!question.s3AudioUrl) {
              // Found first unanswered question
              dispatch(
                goToQuestion({
                  questionIndex: firstUnansweredIndex,
                  partIndex: p,
                })
              );
              return;
            }
            firstUnansweredIndex++;
          }
        }
      }
    }
  }, [attemptData, isExamActive, dispatch]);

  // When resuming, also find first unanswered question in exam mode
  useEffect(() => {
    if (
      examMode === 'exam' &&
      isExamActive &&
      attemptData &&
      currentQuestionIndex === 0
    ) {
      // Check if current question already has recording
      const allQuestions =
        testData?.parts.flatMap((part) => part.questions) || [];
      const currentQuestion = allQuestions[currentQuestionIndex];

      if (currentQuestion) {
        const currentPartIndex =
          testData?.parts.findIndex((part) =>
            part.questions.some((q) => q.id === currentQuestion.id)
          ) || 0;

        const partIndexInAttempt = attemptData.parts.findIndex(
          (p) => p.partIndex === testData?.parts[currentPartIndex].offset
        );
        const questionStatus =
          attemptData.parts[partIndexInAttempt]?.questions?.[0];

        // If current question is already answered, find next unanswered
        if (questionStatus?.s3AudioUrl) {
          let firstUnansweredIndex = currentQuestionIndex + 1;

          for (let p = currentPartIndex; p < attemptData.parts.length; p++) {
            const part = attemptData.parts[p];
            const startQ = p === currentPartIndex ? 1 : 0;
            for (let q = startQ; q < part.questions.length; q++) {
              const question = part.questions[q];
              if (!question.s3AudioUrl) {
                dispatch(
                  goToQuestion({
                    questionIndex: firstUnansweredIndex,
                    partIndex: p,
                  })
                );
                return;
              }
              firstUnansweredIndex++;
            }
          }
        }
      }
    }
  }, [
    examMode,
    isExamActive,
    attemptData,
    currentQuestionIndex,
    testData,
    dispatch,
  ]);

  // Auto-update currentPartIndex when currentQuestionIndex changes in exam mode
  useEffect(() => {
    if (examMode === 'exam' && testData && isExamActive) {
      let questionCount = 0;
      for (let p = 0; p < testData.parts.length; p++) {
        const part = testData.parts[p];
        if (questionCount + part.questions.length > currentQuestionIndex) {
          // Current question is in this part
          if (currentPartIndex !== p) {
            dispatch(
              goToQuestion({
                questionIndex: currentQuestionIndex,
                partIndex: p,
              })
            );
          }
          break;
        }
        questionCount += part.questions.length;
      }
    }
  }, [
    examMode,
    currentQuestionIndex,
    testData,
    currentPartIndex,
    isExamActive,
    dispatch,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!testAttemptId) return;

    try {
      await finishAttempt({ testAttemptId }).unwrap();
      toast.success('Test completed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to finish test:', error);
      toast.error('Failed to submit test');
    }
  }, [testAttemptId, finishAttempt, navigate]);

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAbsoluteQuestionNumber = (
    partIndex: number,
    questionIndex: number
  ) => {
    if (!testData) return 0;
    let count = 0;
    for (let i = 0; i < partIndex; i++) {
      count += testData.parts[i].questions.length;
    }
    return count + questionIndex + 1;
  };

  const totalQuestions =
    testData?.parts.reduce((sum, part) => sum + part.questions.length, 0) ?? 0;

  // Get question status from backend attempt data
  const getQuestionStatus = (partIndex: number, questionIndex: number) => {
    if (!attemptData) return null;
    const attemptPart = attemptData.parts[partIndex];
    if (!attemptPart) return null;
    const attemptQuestion = attemptPart.questions[questionIndex];
    return attemptQuestion;
  };

  // Loading states
  if (isLoading || isLoadingAttempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">
            Loading speaking test...
          </span>
        </div>
      </div>
    );
  }

  if (error || !testData || !attemptData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Unable to load speaking test. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2 xl:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                confirm({
                  title: 'Exit Exam?',
                  description:
                    'Are you sure you want to exit the exam? Your progress will be saved.',
                  variant: 'destructive',
                  onConfirm: () => navigate('/'),
                });
              }}
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
                {examMode === 'exam' ? 'Real Exam Mode' : 'Practice Mode'} -
                Speaking Test
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
            <div className="text-sm text-muted-foreground">
              Question{' '}
              {examMode === 'exam'
                ? currentQuestionIndex + 1
                : '1-' + totalQuestions}{' '}
              of {totalQuestions}
            </div>

            <Button
              onClick={handleSubmit}
              variant="default"
              size="sm"
              className="xl:text-base"
              disabled={isFinishing}
            >
              {isFinishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Finish Test</span>
                  <span className="sm:hidden">Finish</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress
            value={
              examMode === 'exam'
                ? (currentQuestionIndex / totalQuestions) * 100
                : 0
            }
            className="w-full"
          />
        </div>

        <div
          className={`grid ${examMode === 'exam' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-5'} gap-4 xl:gap-8 min-h-[calc(100vh-140px)]`}
        >
          {/* Sidebar - only show in practice mode */}
          {examMode === 'normal' && (
            <div className="xl:col-span-1 order-first xl:order-last">
              <TestPartSidebar
                parts={testData.parts}
                currentPartIndex={localCurrentPartIndex}
                setCurrentPartIndex={setLocalCurrentPartIndex}
              />
            </div>
          )}

          {/* Main Content */}
          <div
            className={`${examMode === 'normal' ? 'xl:col-span-4' : 'col-span-1'}`}
          >
            {examMode === 'exam'
              ? // EXAM MODE: Only show current question
                (() => {
                  const allQuestions = testData.parts.flatMap(
                    (part) => part.questions
                  );
                  const currentQuestion = allQuestions[currentQuestionIndex];
                  const currentPart = testData.parts.find((part) =>
                    part.questions.some((q) => q.id === currentQuestion?.id)
                  );

                  if (!currentQuestion || !currentPart) {
                    return (
                      <div className="text-center py-8">
                        <Alert className="max-w-md mx-auto border-green-200 bg-green-50">
                          <AlertCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            Exam completed! Submitting your answers...
                          </AlertDescription>
                        </Alert>
                      </div>
                    );
                  }

                  // Find question status from backend
                  const partIndexInAttempt = attemptData.parts.findIndex(
                    (part: SpeakingAttemptData['parts'][0]) =>
                      part.partIndex === currentPart.offset
                  );
                  const questionIndexInPart = currentPart.questions.findIndex(
                    (q) => q.id === currentQuestion.id
                  );
                  const questionStatus = getQuestionStatus(
                    partIndexInAttempt,
                    questionIndexInPart
                  );

                  return (
                    <div className="w-full p-4 xl:p-6">
                      {/* Current Part Instructions */}
                      <div className="mb-6 p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">
                          {currentPart.title}
                        </h3>
                        <div
                          className="prose prose-sm max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{
                            __html: currentPart.direction.text,
                          }}
                        />

                        {/* Narrator section if available */}
                        {currentPart.narrator && (
                          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                            <h4 className="font-medium mb-2">Scenario:</h4>
                            {currentPart.narrator.text && (
                              <p className="text-sm mb-2">
                                {currentPart.narrator.text}
                              </p>
                            )}
                            {currentPart.narrator.audio && (
                              <AudioPlayer
                                audioUrl={currentPart.narrator.audio}
                                className="mt-2"
                              />
                            )}
                            {currentPart.narrator.image && (
                              <div className="mt-2">
                                <img
                                  src={currentPart.narrator.image}
                                  alt="Scenario image"
                                  className="max-w-full h-auto rounded border"
                                  style={{ maxHeight: '400px' }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Single Current Question */}
                      <SpeakingQuestion
                        key={currentQuestion.id}
                        question={currentQuestion}
                        partTitle={currentPart.title}
                        questionIndex={currentQuestionIndex}
                        totalQuestions={allQuestions.length}
                        absoluteQuestionNumber={currentQuestionIndex + 1}
                        isReviewMode={false}
                        testAttemptId={testAttemptId ?? undefined}
                        uploadedAudioUrl={questionStatus?.s3AudioUrl}
                      />

                      {/* Progress indicator */}
                      <div className="mt-6 text-center text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of{' '}
                        {allQuestions.length}
                        <p className="mt-2 text-xs">
                          Automatic progression - no manual navigation allowed
                        </p>
                      </div>
                    </div>
                  );
                })()
              : // PRACTICE MODE: Show all questions in current part with navigation
                testData.parts[localCurrentPartIndex] && (
                  <div
                    className="h-[calc(100vh-105px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2 xl:pr-4 scroll-smooth bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
                    data-testid="main-scroll-container"
                  >
                    <div className="p-4 xl:p-6">
                      <div className="w-full">
                        {/* Part Instructions */}
                        <div className="mb-6 p-4 bg-muted rounded-lg">
                          <h3 className="font-semibold mb-2">
                            {testData.parts[localCurrentPartIndex].title}
                          </h3>
                          <div
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html:
                                testData.parts[localCurrentPartIndex].direction
                                  .text,
                            }}
                          />

                          {/* Narrator section if available */}
                          {testData.parts[localCurrentPartIndex].narrator && (
                            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                              <h4 className="font-medium mb-2">Scenario:</h4>
                              {testData.parts[localCurrentPartIndex].narrator
                                .text && (
                                <p className="text-sm mb-2">
                                  {
                                    testData.parts[localCurrentPartIndex]
                                      .narrator.text
                                  }
                                </p>
                              )}
                              {testData.parts[localCurrentPartIndex].narrator
                                .audio && (
                                <AudioPlayer
                                  audioUrl={
                                    testData.parts[localCurrentPartIndex]
                                      .narrator.audio
                                  }
                                  className="mt-2"
                                />
                              )}
                              {testData.parts[localCurrentPartIndex].narrator
                                .image && (
                                <div className="mt-2">
                                  <img
                                    src={
                                      testData.parts[localCurrentPartIndex]
                                        .narrator.image
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
                          {testData.parts[localCurrentPartIndex].questions.map(
                            (question, qIndex) => {
                              // Find corresponding backend status
                              const partIndexInAttempt =
                                attemptData.parts.findIndex(
                                  (part: SpeakingAttemptData['parts'][0]) =>
                                    part.partIndex ===
                                    testData.parts[localCurrentPartIndex].offset
                                );
                              const questionStatus = getQuestionStatus(
                                partIndexInAttempt,
                                qIndex
                              );

                              return (
                                <SpeakingQuestion
                                  key={question.id}
                                  question={question}
                                  partTitle={
                                    testData.parts[localCurrentPartIndex].title
                                  }
                                  questionIndex={qIndex}
                                  totalQuestions={
                                    testData.parts[localCurrentPartIndex]
                                      .questions.length
                                  }
                                  absoluteQuestionNumber={getAbsoluteQuestionNumber(
                                    localCurrentPartIndex,
                                    qIndex
                                  )}
                                  isReviewMode={false}
                                  testAttemptId={testAttemptId ?? undefined}
                                  uploadedAudioUrl={questionStatus?.s3AudioUrl}
                                />
                              );
                            }
                          )}
                        </div>

                        {/* Navigation for practice mode */}
                        <div className="flex justify-between mt-8">
                          <Button
                            variant="outline"
                            onClick={() =>
                              setLocalCurrentPartIndex(
                                Math.max(0, localCurrentPartIndex - 1)
                              )
                            }
                            disabled={localCurrentPartIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous Part
                          </Button>

                          {localCurrentPartIndex ===
                          testData.parts.length - 1 ? (
                            <Button
                              onClick={handleSubmit}
                              disabled={isFinishing}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isFinishing ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                'Finish Test'
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                setLocalCurrentPartIndex(
                                  Math.min(
                                    testData.parts.length - 1,
                                    localCurrentPartIndex + 1
                                  )
                                )
                              }
                              disabled={
                                localCurrentPartIndex ===
                                testData.parts.length - 1
                              }
                            >
                              Next Part
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom padding for smooth scrolling */}
                    <div className="h-16"></div>
                  </div>
                )}
          </div>
        </div>
      </div>
      {ConfirmDialog}
    </div>
  );
};

export default SpeakingExam;
