import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeakingQuestion } from '@/features/tests/components/speak-write/speaking/SpeakingQuestion';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useGetSpeakingTestByIdQuery } from '@/features/tests/services/speakingTestApi';
import type { SpeakingTestDetail } from '@/features/tests/types/speaking-test.types';
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
  const [mergedTestData, setMergedTestData] =
    useState<SpeakingTestDetail | null>(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(true);
  const hasResumedRef = useRef(false);

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

  // Transform testData with attempt data
  useEffect(() => {
    if (testData && attemptData) {
      // Create a deep copy of testData and update with attempt data
      const merged = structuredClone(testData);

      // Update merged questions with actual questionText from attempt
      merged.parts.forEach((part, partIndex) => {
        const attemptPart = attemptData.parts.find(
          (p) => p.partIndex === part.offset
        );
        if (attemptPart) {
          part.questions.forEach((question, qIndex) => {
            const attemptQuestion = attemptPart.questions[qIndex];
            // Backend returns questionText, not promptText
            if (attemptQuestion?.questionText) {
              question.title = attemptQuestion.questionText;
            }
            if (attemptQuestion?.promptImage) {
              question.image = attemptQuestion.promptImage;
            }
          });
        }
      });

      setMergedTestData(merged);
    } else if (testData && !attemptData) {
      setMergedTestData(testData);
    }
  }, [testData, attemptData]);

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
              console.log(
                'Found first unanswered question at index:',
                firstUnansweredIndex
              );
              return;
            }
            firstUnansweredIndex++;
          }
        }
      }
    }
  }, [attemptData, isExamActive, dispatch]);

  // Resume to first unanswered question when data is loaded (for exam mode)
  // This handles the case when user exits and comes back
  useEffect(() => {
    if (
      examMode === 'exam' &&
      isExamActive &&
      attemptData &&
      mergedTestData &&
      !hasResumedRef.current
    ) {
      console.log('=== Resume Logic Debug ===');
      console.log('attemptData.parts:', attemptData.parts);
      console.log('mergedTestData.parts:', mergedTestData.parts);

      // Find the first unanswered question
      let absoluteQuestionIndex = 0;
      let foundUnanswered = false;

      // Loop through all parts in attempt data
      for (let p = 0; p < attemptData.parts.length; p++) {
        const attemptPart = attemptData.parts[p];
        console.log(
          `Checking part ${p} (partIndex: ${attemptPart.partIndex}):`,
          attemptPart
        );

        // Loop through all questions in this part
        for (let q = 0; q < attemptPart.questions.length; q++) {
          const question = attemptPart.questions[q];
          console.log(`  Question ${q} (absolute: ${absoluteQuestionIndex}):`, {
            questionNumber: question.questionNumber,
            hasAudio: !!question.s3AudioUrl,
            s3AudioUrl: question.s3AudioUrl,
          });

          if (!question.s3AudioUrl) {
            // Found first unanswered question
            console.log('✅ Found first unanswered question:', {
              partIndex: p,
              questionIndexInPart: q,
              absoluteQuestionIndex,
              questionNumber: question.questionNumber,
            });

            // Only navigate if we're not already at this question
            if (currentQuestionIndex !== absoluteQuestionIndex) {
              console.log(
                `Navigating from ${currentQuestionIndex} to ${absoluteQuestionIndex}`
              );
              dispatch(
                goToQuestion({
                  questionIndex: absoluteQuestionIndex,
                  partIndex: p,
                })
              );
            } else {
              console.log('Already at the correct question');
            }

            foundUnanswered = true;
            hasResumedRef.current = true;
            break;
          }

          // Move to next question
          absoluteQuestionIndex++;
        }

        if (foundUnanswered) break;
      }

      if (!foundUnanswered) {
        console.log(
          '⚠️ No unanswered questions found. All questions completed?'
        );
      }

      console.log('=== End Resume Logic Debug ===');
    }
  }, [
    examMode,
    isExamActive,
    attemptData,
    mergedTestData,
    dispatch,
    currentQuestionIndex,
  ]);

  // Auto-update currentPartIndex when currentQuestionIndex changes in exam mode
  useEffect(() => {
    if (examMode === 'exam' && mergedTestData && isExamActive) {
      let questionCount = 0;
      for (let p = 0; p < mergedTestData.parts.length; p++) {
        const part = mergedTestData.parts[p];
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
    mergedTestData,
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
    if (!mergedTestData) return 0;
    let count = 0;
    for (let i = 0; i < partIndex; i++) {
      count += mergedTestData.parts[i].questions.length;
    }
    return count + questionIndex + 1;
  };

  const totalQuestions =
    mergedTestData?.parts.reduce(
      (sum, part) => sum + part.questions.length,
      0
    ) ?? 0;

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

  if (error || !mergedTestData || !attemptData) {
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
                {mergedTestData.testTitle}
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
                parts={mergedTestData.parts}
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
                  const allQuestions = mergedTestData.parts.flatMap(
                    (part) => part.questions
                  );
                  const currentQuestion = allQuestions[currentQuestionIndex];
                  const currentPart = mergedTestData.parts.find((part) =>
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
                  // We need to map by absolute question number, not by part index
                  const absoluteQuestionNum = currentQuestionIndex + 1; // 1-based

                  let questionStatus = null;
                  // Search through all parts to find matching questionNumber
                  for (const attemptPart of attemptData.parts) {
                    const foundQuestion = attemptPart.questions.find(
                      (q) => q.questionNumber === absoluteQuestionNum
                    );
                    if (foundQuestion) {
                      questionStatus = foundQuestion;
                      console.log('Found question status:', {
                        questionNumber: absoluteQuestionNum,
                        hasAudio: !!foundQuestion.s3AudioUrl,
                        s3AudioUrl: foundQuestion.s3AudioUrl,
                      });
                      break;
                    }
                  }

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
                mergedTestData.parts[localCurrentPartIndex] && (
                  <div
                    className="h-[calc(100vh-105px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2 xl:pr-4 scroll-smooth bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
                    data-testid="main-scroll-container"
                  >
                    <div className="p-4 xl:p-6">
                      <div className="w-full">
                        {/* Part Instructions */}
                        <div className="mb-6 p-4 bg-muted rounded-lg">
                          <h3 className="font-semibold mb-2">
                            {mergedTestData.parts[localCurrentPartIndex].title}
                          </h3>
                          <div
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html:
                                mergedTestData.parts[localCurrentPartIndex]
                                  .direction.text,
                            }}
                          />

                          {/* Narrator section if available */}
                          {mergedTestData.parts[localCurrentPartIndex]
                            .narrator && (
                            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                              <h4 className="font-medium mb-2">Scenario:</h4>
                              {mergedTestData.parts[localCurrentPartIndex]
                                .narrator.text && (
                                <p className="text-sm mb-2">
                                  {
                                    mergedTestData.parts[localCurrentPartIndex]
                                      .narrator.text
                                  }
                                </p>
                              )}
                              {mergedTestData.parts[localCurrentPartIndex]
                                .narrator.audio && (
                                <AudioPlayer
                                  audioUrl={
                                    mergedTestData.parts[localCurrentPartIndex]
                                      .narrator.audio
                                  }
                                  className="mt-2"
                                />
                              )}
                              {mergedTestData.parts[localCurrentPartIndex]
                                .narrator.image && (
                                <div className="mt-2">
                                  <img
                                    src={
                                      mergedTestData.parts[
                                        localCurrentPartIndex
                                      ].narrator.image
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
                          {mergedTestData.parts[
                            localCurrentPartIndex
                          ].questions.map((question, qIndex) => {
                            // Find corresponding backend status by absolute question number
                            const absoluteQuestionNum =
                              getAbsoluteQuestionNumber(
                                localCurrentPartIndex,
                                qIndex
                              );

                            let questionStatus = null;
                            // Search through all parts to find matching questionNumber
                            for (const attemptPart of attemptData.parts) {
                              const foundQuestion = attemptPart.questions.find(
                                (q) => q.questionNumber === absoluteQuestionNum
                              );
                              if (foundQuestion) {
                                questionStatus = foundQuestion;
                                break;
                              }
                            }

                            return (
                              <SpeakingQuestion
                                key={question.id}
                                question={question}
                                partTitle={
                                  mergedTestData.parts[localCurrentPartIndex]
                                    .title
                                }
                                questionIndex={qIndex}
                                totalQuestions={
                                  mergedTestData.parts[localCurrentPartIndex]
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
                          })}
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
                          mergedTestData.parts.length - 1 ? (
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
                                    mergedTestData.parts.length - 1,
                                    localCurrentPartIndex + 1
                                  )
                                )
                              }
                              disabled={
                                localCurrentPartIndex ===
                                mergedTestData.parts.length - 1
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
