import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeakingQuestion } from '@/features/tests/components/speak-write/speaking/SpeakingQuestion';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useGetSpeakingTestByIdQuery } from '@/features/tests/services/speakingTestApi';
import {
  useFinishSpeakingAttemptMutation,
  useSubmitSpeakingQuestionMutation,
} from '@/features/tests/services/speakingAttemptApi';
import { toast } from 'sonner';
import type { SpeakingPart as SpeakingPartType } from '@/features/tests/types/speaking-test.types';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  startExam,
  endExam,
  updateGlobalTime,
  restoreFromRecovery,
  setRecoveryInfo,
  clearRecoveryInfo,
} from '@/features/tests/slices/speakingExamSlice';
import {
  saveRecoveryData,
  loadRecoveryData,
  clearRecoveryData,
  calculateRemainingTime,
  isExamExpired,
} from '@/features/tests/utils/examRecovery';
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestPartSidebar } from '@/features/tests/components/speak-write/TestPartSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const SpeakingExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Redux state - for exam mode this controls everything
  const {
    examMode,
    isExamActive,
    currentQuestionIndex,
    currentPartIndex,
    questionStates,
    recoveryInfo,
    globalTimeLeft,
    examCompleted,
  } = useAppSelector((state) => state.speakingExam);

  // Local state only for normal mode navigation
  const [localCurrentPartIndex, setLocalCurrentPartIndex] = useState(0);
  const [recordedBlobs, setRecordedBlobs] = useState<Map<number, Blob>>(
    new Map()
  );
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryData, setRecoveryData] =
    useState<ReturnType<typeof loadRecoveryData>>(null);
  const [totalTime] = useState(20 * 60); // 20 minutes
  const [timeRemaining, setTimeRemaining] = useState(totalTime);

  const [testAttemptId, setTestAttemptId] = useState(
    location.state?.testAttemptId
  );

  // Check for recovery data on mount
  useEffect(() => {
    const storedRecovery = loadRecoveryData();
    if (storedRecovery && storedRecovery.recoveryInfo.testId === testId) {
      setRecoveryData(storedRecovery);
      setShowRecoveryDialog(true);
    } else if (!testAttemptId) {
      navigate(`/test/speaking/${testId}/check`);
      return;
    }
  }, [testAttemptId, navigate, testId]);

  // API call to get test data
  const {
    data: testData,
    error,
    isLoading,
  } = useGetSpeakingTestByIdQuery(testId!);

  const [submitSpeakingQuestion] = useSubmitSpeakingQuestionMutation();
  const [finishAttempt, { isLoading: isFinishing }] =
    useFinishSpeakingAttemptMutation();

  const handleSubmit = useCallback(async () => {
    if (testAttemptId) {
      try {
        // Submit all unsubmitted questions
        const submitPromises = Object.entries(questionStates)
          .filter(
            ([id, state]) => state.hasAudio && state.phase !== 'submitted'
          )
          .map(async ([id, state]) => {
            const blob = recordedBlobs.get(Number(id));
            if (blob) {
              return submitSpeakingQuestion({
                testAttemptId,
                questionNumber: Number(id), // Corrected to use questionNumber
                file: blob,
              }).unwrap();
            }
          });
        await Promise.all(submitPromises);

        await finishAttempt({ testAttemptId }).unwrap();
        clearRecoveryData();
        if (examMode === 'exam') {
          dispatch(endExam());
        }
        toast.success('Exam completed successfully!');
      } catch (e) {
        // handled globally
      }
    }
    navigate('/');
  }, [
    testAttemptId,
    questionStates,
    recordedBlobs,
    submitSpeakingQuestion,
    finishAttempt,
    examMode,
    dispatch,
    navigate,
  ]);

  // Initialize exam when test data loads
  useEffect(() => {
    if (testData && !isExamActive && !examCompleted && examMode === 'exam') {
      const questions = testData.parts.flatMap((part) =>
        part.questions.map((q) => ({
          id: q.id,
          preparationTime: q.time_to_think || 30,
          recordingTime: q.limit_time || 60,
        }))
      );

      const totalDuration = 20 * 60; // 20 minutes for exam mode

      dispatch(
        startExam({
          testId: testId!,
          totalDuration,
          questions,
        })
      );

      if (testData.testEndTime) {
        dispatch(
          setRecoveryInfo({
            testId: testId!,
            testEndTime: testData.testEndTime,
            startedAt: new Date().toISOString(),
            totalDuration,
          })
        );
      }
    }
  }, [testData, dispatch, testId, examMode, isExamActive, examCompleted]);

  // Auto-save recovery data periodically
  useEffect(() => {
    if (isExamActive && examMode === 'exam') {
      const interval = setInterval(() => {
        if (recoveryInfo) {
          saveRecoveryData({
            recoveryInfo,
            questionStates,
            currentQuestionIndex,
            currentPartIndex,
            testAttemptId,
            lastSavedAt: new Date().toISOString(),
          });
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [
    isExamActive,
    examMode,
    recoveryInfo,
    questionStates,
    currentQuestionIndex,
    currentPartIndex,
    testAttemptId,
  ]);

  // Save recovery immediately when question advances
  useEffect(() => {
    if (isExamActive && examMode === 'exam' && recoveryInfo) {
      saveRecoveryData({
        recoveryInfo,
        questionStates,
        currentQuestionIndex,
        currentPartIndex,
        testAttemptId,
        lastSavedAt: new Date().toISOString(),
      });
    }
  }, [
    currentQuestionIndex,
    isExamActive,
    examMode,
    recoveryInfo,
    questionStates,
    currentPartIndex,
    testAttemptId,
  ]);

  // Global timer for exam mode
  useEffect(() => {
    if (isExamActive && examMode === 'exam' && globalTimeLeft > 0) {
      const timer = setInterval(() => {
        dispatch(updateGlobalTime(globalTimeLeft - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isExamActive, examMode, globalTimeLeft, dispatch]);

  // End exam when time expires
  useEffect(() => {
    if (globalTimeLeft === 0 && isExamActive) {
      dispatch(endExam());
      toast.warning('Time expired! Exam has ended.');
      handleSubmit();
    }
  }, [globalTimeLeft, isExamActive, dispatch, handleSubmit]);

  const handleRecovery = (restore: boolean) => {
    setShowRecoveryDialog(false);

    if (restore && recoveryData) {
      if (
        recoveryData.recoveryInfo.testEndTime &&
        isExamExpired(recoveryData.recoveryInfo.testEndTime)
      ) {
        toast.error('The exam has expired and cannot be recovered.');
        clearRecoveryData();
        return;
      }

      let remainingTime = globalTimeLeft;
      if (recoveryData.recoveryInfo.testEndTime) {
        remainingTime = calculateRemainingTime(
          recoveryData.recoveryInfo.testEndTime
        );
      }

      dispatch(
        restoreFromRecovery({
          questionStates: recoveryData.questionStates,
          currentQuestionIndex: recoveryData.currentQuestionIndex,
          currentPartIndex: recoveryData.currentPartIndex,
          globalTimeLeft: remainingTime,
        })
      );

      if (recoveryData.testAttemptId) {
        setTestAttemptId(recoveryData.testAttemptId);
      }

      toast.success('Exam progress restored successfully!');
    } else {
      clearRecoveryData();
      dispatch(clearRecoveryInfo());
    }
  };

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

  const handleBlobRecorded = useCallback((questionId: number, blob: Blob) => {
    setRecordedBlobs((prev) => new Map(prev.set(questionId, blob)));
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
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

  if (error || !testData) {
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

  const totalQuestions = getTotalQuestions();

  return (
    <div className="min-h-screen bg-background">
      {/* Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Recover Previous Session
            </DialogTitle>
            <DialogDescription>
              We found a previous exam session. Would you like to continue where
              you left off?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleRecovery(false)}>
              Start Fresh
            </Button>
            <Button onClick={() => handleRecovery(true)}>
              Continue Previous Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                {examMode === 'exam' ? 'Real Exam Mode' : 'Practice Mode'} -
                Speaking Test
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
            {examMode === 'exam' && (
              <div className="flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono">
                <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
                <span
                  className={
                    globalTimeLeft <= 300 ? 'text-red-600 font-medium' : ''
                  }
                >
                  {formatTime(globalTimeLeft)}
                </span>
              </div>
            )}
            {examMode === 'normal' && (
              <div className="flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono">
                <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Question {examMode === 'exam' ? currentQuestionIndex + 1 : 1} of{' '}
              {totalQuestions}
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
          {/* Sidebar - only show in normal mode */}
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
                        onBlobRecorded={handleBlobRecorded}
                        isReviewMode={false}
                        testAttemptId={testAttemptId ?? undefined}
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
              : // NORMAL MODE: Show all questions in current part with navigation
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
                            (question, qIndex) => (
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
                                onBlobRecorded={handleBlobRecorded}
                                isReviewMode={false}
                                testAttemptId={testAttemptId ?? undefined}
                              />
                            )
                          )}
                        </div>

                        {/* Navigation for normal mode */}
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

            {/* Auto-submit for exam mode */}
            {examMode === 'exam' && examCompleted && (
              <div className="mt-8 text-center">
                <Alert className="max-w-md mx-auto border-green-200 bg-green-50">
                  <AlertCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Exam completed! Submitting your answers...
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingExam;
