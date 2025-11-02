import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WritingQuestion } from '@/features/tests/components/speak-write/writing/WritingQuestion';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useGetWritingTestByIdQuery } from '@/features/tests/services/writingTestApi';
import { useSubmitWritingAttemptMutation } from '@/features/tests/services/writingAttemptApi';
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestPartSidebar } from '@/features/tests/components/speak-write/TestPartSidebar';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  startWritingExam,
  endWritingExam,
  updateWritingGlobalTime,
  updateWritingAnswer,
  goToWritingPart,
  lockWritingPart,
  updatePartTime,
  restoreWritingFromRecovery,
  setWritingRecoveryInfo,
  clearWritingRecoveryInfo,
  resetWritingExam,
} from '@/features/tests/slices/writingExamSlice';
import {
  saveWritingRecoveryData,
  loadWritingRecoveryData,
  clearWritingRecoveryData,
  type WritingRecoveryData,
} from '@/features/tests/utils/writingExamRecovery';
import { WritingRecoveryDialog } from '@/features/tests/components/speak-write/writing/WritingRecoveryDialog';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useLazyCheckCanAffordFeatureQuery } from '@/features/auth/services/creditsApi';
import { FeaturePricingType } from '@/features/auth/services/creditsApi';
import type { CheckAffordFeatureResponse } from '@/features/auth/services/creditsApi';
import { AffordabilityDialog } from '@/features/lr-analyze/components/AffordabilityDialog';
import { toast } from 'sonner';

const PART_TIME_LIMITS = {
  1: 8 * 60,
  2: 20 * 60,
  3: 32 * 60,
};

const WritingExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    examMode,
    isExamActive,
    examCompleted,
    currentPartIndex,
    partStates,
    recoveryInfo,
    globalTimeLeft,
  } = useAppSelector((state) => state.writingExam);

  const [localCurrentPartIndex, setLocalCurrentPartIndex] = useState(0);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryData, setRecoveryData] = useState<WritingRecoveryData | null>(
    null
  );
  const [showAffordabilityDialog, setShowAffordabilityDialog] = useState(false);

  const {
    data: testData,
    error,
    isLoading,
  } = useGetWritingTestByIdQuery(testId!);

  const [submitAttempt, { isLoading: isSubmitting }] =
    useSubmitWritingAttemptMutation();

  // Reset exam state when testId changes (BEFORE recovery check)
  useEffect(() => {
    // Reset the exam to ensure clean state for new test
    dispatch(resetWritingExam());
  }, [testId, dispatch]);

  // Cleanup on unmount or testId change
  useEffect(() => {
    return () => {
      // Component is unmounting - stop all timers and prevent further saves
    };
  }, [testId, dispatch]);

  // Check for recovery data on mount (only once per testId)
  useEffect(() => {
    const checkRecovery = async () => {
      if (!testId) return;

      const storedRecovery = await loadWritingRecoveryData(testId);

      // Only show recovery dialog if:
      // 1. Recovery data exists
      // 2. The testId matches exactly
      // 3. Exam is not already completed
      if (
        storedRecovery &&
        storedRecovery.recoveryInfo.testId === testId &&
        !examCompleted
      ) {
        setRecoveryData(storedRecovery);
        setShowRecoveryDialog(true);
      } else {
        // Clear any mismatched recovery data
        if (storedRecovery && storedRecovery.recoveryInfo.testId !== testId) {
          await clearWritingRecoveryData(storedRecovery.recoveryInfo.testId);
        }
      }
    };
    checkRecovery();
    // Only run once when testId changes, ignore examCompleted changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // Initialize exam when test data loads (for BOTH practice and exam modes)
  useEffect(() => {
    if (testData && !isExamActive) {
      const parts = testData.parts.map((part, index) => ({
        partNumber: index + 1,
        timeLimit:
          PART_TIME_LIMITS[(index + 1) as keyof typeof PART_TIME_LIMITS] || 0,
        questions: part.questions.map((q) => ({ id: q.id })),
      }));

      dispatch(
        startWritingExam({
          testId: testId!,
          parts,
        })
      );

      dispatch(
        setWritingRecoveryInfo({
          testId: testId!,
          startedAt: new Date().toISOString(),
          examMode: examMode,
        })
      );
    }
  }, [testData, dispatch, testId, examMode, isExamActive]);

  // Global timer for both practice and exam modes
  useEffect(() => {
    if (isExamActive && globalTimeLeft > 0) {
      const timer = setInterval(() => {
        dispatch(updateWritingGlobalTime(globalTimeLeft - 1));

        // Exam mode specific logic: update part timers and auto-progress
        if (examMode === 'exam') {
          const currentPart = partStates[currentPartIndex + 1];
          if (currentPart) {
            dispatch(
              updatePartTime({
                partNumber: currentPartIndex + 1,
                timeLeft: currentPart.timeLeft - 1,
              })
            );

            if (currentPart.timeLeft <= 1 && currentPartIndex < 2) {
              dispatch(lockWritingPart(currentPartIndex + 1));
              dispatch(goToWritingPart(currentPartIndex + 1));
              toast.info(`Moving to Part ${currentPartIndex + 2}`);
            }
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [
    isExamActive,
    examMode,
    globalTimeLeft,
    dispatch,
    partStates,
    currentPartIndex,
  ]);

  // End exam when time expires (both modes)
  useEffect(() => {
    if (globalTimeLeft === 0 && isExamActive) {
      if (examMode === 'exam') {
        dispatch(endWritingExam());
        toast.warning('Time expired! Submitting your answers...');
        handleSubmit();
      } else {
        // Practice mode: just notify, don't auto-submit
        toast.warning('Time expired! You can continue or submit.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTimeLeft, isExamActive, examMode, dispatch]);

  const handleRecovery = (restore: boolean) => {
    setShowRecoveryDialog(false);

    if (restore && recoveryData) {
      dispatch(
        restoreWritingFromRecovery({
          partStates: recoveryData.partStates,
          currentPartIndex: recoveryData.currentPartIndex,
          currentQuestionIndex: 0,
          globalTimeLeft: recoveryData.globalTimeLeft,
        })
      );
      toast.success('Exam progress restored successfully!');
    } else if (testId) {
      clearWritingRecoveryData(testId);
      dispatch(clearWritingRecoveryInfo());
      dispatch(resetWritingExam()); // Reset to ensure examCompleted is false
    }
  };

  const handleAnswer = useCallback(
    (questionId: number, answer: string) => {
      const answerText = answer;
      const wordCount = answerText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      if (testData) {
        testData.parts.forEach((part, pIndex) => {
          const question = part.questions.find((q) => q.id === questionId);
          if (question) {
            dispatch(
              updateWritingAnswer({
                partNumber: pIndex + 1,
                questionId,
                answer: answerText,
                wordCount,
              })
            );
          }
        });
      }
    },
    [dispatch, testData]
  );

  // Create a stable reference for answers to detect changes
  const answersSignature = useMemo(() => {
    if (!partStates) return '';
    return Object.values(partStates)
      .map((part) =>
        Object.values(part.questions)
          .map((q) => `${q.id}:${q.answer}:${q.wordCount}`)
          .join('|')
      )
      .join('||');
  }, [partStates]);

  // Auto-save to IndexedDB after 5 seconds of inactivity (for both practice and exam modes)
  useEffect(() => {
    if (!isExamActive || !recoveryInfo || !partStates || !testId) {
      return;
    }

    // Verify that recoveryInfo.testId matches current testId
    if (recoveryInfo.testId !== testId) {
      return;
    }

    const saveToIndexedDB = async () => {
      try {
        // Double-check testId before saving
        if (recoveryInfo.testId !== testId) {
          return;
        }

        await saveWritingRecoveryData({
          recoveryInfo,
          partStates,
          currentPartIndex,
          currentQuestionIndex: 0,
          globalTimeLeft,
          lastSavedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[WritingExam] Auto-save failed:', error);
      }
    };

    const timeoutId = setTimeout(saveToIndexedDB, 1000); // Auto-save after 1 seconds

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answersSignature, isExamActive, testId]); // Only depend on answers changes and essential flags

  // Submit writing test after affordability dialog is confirmed
  const proceedWithSubmit = useCallback(async () => {
    if (!testData || !partStates) {
      return;
    }

    try {
      const answers: Array<{
        questionId: number;
        answer: string;
      }> = [];

      Object.values(partStates).forEach((partState) => {
        Object.values(partState.questions).forEach((questionState) => {
          if (questionState.answer.trim()) {
            answers.push({
              questionId: questionState.id,
              answer: questionState.answer,
            });
          }
        });
      });

      // Show loading toast
      toast.info(
        'Submitting your test... AI is grading your answers (this may take 1-2 minutes)'
      );

      const result = await submitAttempt({
        testId: testId!,
        answers,
      }).unwrap();

      if (testId) {
        await clearWritingRecoveryData(testId);
      }
      if (examMode === 'exam') {
        dispatch(endWritingExam());
      }

      toast.success('Test submitted successfully! Redirecting to results...');

      // Navigate immediately with resultId
      if (result.data?.resultId) {
        navigate(`/writing-result?id=${result.data.resultId}`);
      } else {
        toast.error('No result ID returned. Please check your exam attempts.');
        navigate('/exam-attempts');
      }
    } catch (error) {
      console.error('[WritingExam] Failed to submit test:', error);
      toast.error('Failed to submit test. Please try again.');
    }
  }, [
    testData,
    partStates,
    submitAttempt,
    testId,
    examMode,
    dispatch,
    navigate,
  ]);

  const handleSubmit = useCallback(async () => {
    // Save progress before submitting - but verify testId matches
    if (
      recoveryInfo &&
      partStates &&
      testId &&
      recoveryInfo.testId === testId
    ) {
      try {
        await saveWritingRecoveryData({
          recoveryInfo,
          partStates,
          currentPartIndex,
          currentQuestionIndex: 0,
          globalTimeLeft,
          lastSavedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[WritingExam] Failed to save before submit:', error);
      }
    }

    // Show affordability dialog
    setShowAffordabilityDialog(true);
  }, [partStates, testId, recoveryInfo, currentPartIndex, globalTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getUserAnswer = (questionId: number): string => {
    if (!partStates) {
      return '';
    }

    for (const partState of Object.values(partStates)) {
      if (partState.questions[questionId]) {
        const answer = partState.questions[questionId].answer;
        return answer;
      }
    }
    return '';
  };

  const handleExit = async () => {
    // Save progress before exit - but verify testId matches
    if (
      recoveryInfo &&
      partStates &&
      testId &&
      recoveryInfo.testId === testId
    ) {
      try {
        await saveWritingRecoveryData({
          recoveryInfo,
          partStates,
          currentPartIndex,
          currentQuestionIndex: 0,
          globalTimeLeft,
          lastSavedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[WritingExam] Failed to save before exit:', error);
      }
    } else if (recoveryInfo && recoveryInfo.testId !== testId) {
      console.warn('[WritingExam] Exit save skipped: testId mismatch', {
        currentTestId: testId,
        recoveryTestId: recoveryInfo.testId,
      });
    }

    // Exit logic will be handled by ConfirmationDialog
  };

  const confirmExit = async () => {
    if (examCompleted && testId) {
      await clearWritingRecoveryData(testId);
    }
    if (examMode === 'exam') {
      dispatch(endWritingExam());
    }
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
  const effectivePartIndex =
    examMode === 'exam' ? currentPartIndex : localCurrentPartIndex;

  return (
    <div className="min-h-screen bg-background">
      {/* Recovery Dialog */}
      <WritingRecoveryDialog
        open={showRecoveryDialog}
        onOpenChange={setShowRecoveryDialog}
        onRestore={() => handleRecovery(true)}
        onStartFresh={() => handleRecovery(false)}
      />

      <div className="mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 xl:gap-4 flex-1 min-w-0">
            <ConfirmationDialog
              title="Exit Writing Test?"
              description={`Your progress will be saved automatically. You can resume this practice test later from where you left off.`}
              confirmText="Exit"
              cancelText="Continue"
              variant="default"
              onConfirm={confirmExit}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleExit}
                className="flex items-center gap-1 xl:gap-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </ConfirmationDialog>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg xl:text-2xl font-bold text-foreground truncate">
                {testData.testTitle}
              </h1>
              <p className="text-xs xl:text-sm text-muted-foreground">
                {examMode === 'exam' ? 'Real Exam Mode' : 'Practice Mode'} -
                Writing Test
              </p>
              {examMode === 'exam' && (
                <div className="mt-1">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 bg-primary/10 text-primary font-medium text-xs rounded-md border border-primary/20">
                    Part {effectivePartIndex + 1} of {testData.parts.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 xl:gap-4 flex-shrink-0">
            {/* Timer - Countdown for both modes */}
            <div className="flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono">
              <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
              <span
                className={
                  globalTimeLeft <= 300
                    ? 'text-red-600 font-medium'
                    : examMode === 'practice'
                      ? 'text-blue-600'
                      : ''
                }
              >
                {formatTime(globalTimeLeft)}
              </span>
            </div>

            {/* Part timer - only for exam mode */}
            {examMode === 'exam' && partStates[effectivePartIndex + 1] && (
              <div className="text-xs text-muted-foreground">
                Part {effectivePartIndex + 1}:{' '}
                {formatTime(partStates[effectivePartIndex + 1].timeLeft)}
              </div>
            )}

            <Button
              onClick={handleSubmit}
              variant="default"
              size="sm"
              className="xl:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Submitting...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit Test</span>
                  <span className="sm:hidden">Submit</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div
          className={`grid ${examMode === 'exam' ? 'grid-cols-1' : 'grid-cols-1 xl:grid-cols-5'} gap-4 xl:gap-8 min-h-[calc(100vh-140px)]`}
        >
          {examMode === 'practice' && (
            <div className="xl:col-span-1 order-first xl:order-last">
              <TestPartSidebar
                parts={testData.parts}
                currentPartIndex={localCurrentPartIndex}
                setCurrentPartIndex={setLocalCurrentPartIndex}
              />
            </div>
          )}

          <div
            className={`${examMode === 'practice' ? 'xl:col-span-4' : 'col-span-1'}`}
          >
            <div
              className="h-[calc(100vh-105px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-2 xl:pr-4 scroll-smooth bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
              data-testid="main-scroll-container"
            >
              <div className="p-4 xl:p-6">
                {testData.parts[effectivePartIndex] && (
                  <div className="w-full">
                    <div className="mb-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">
                        {testData.parts[effectivePartIndex].title}
                      </h3>
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html:
                            testData.parts[effectivePartIndex].direction.text,
                        }}
                      />
                    </div>

                    <div className="space-y-6">
                      {testData.parts[effectivePartIndex].questions.map(
                        (question, qIndex) => (
                          <WritingQuestion
                            key={`q-${effectivePartIndex}-${qIndex}`}
                            question={question}
                            part={testData.parts[effectivePartIndex]}
                            partTitle={testData.parts[effectivePartIndex].title}
                            questionIndex={qIndex}
                            totalQuestions={
                              testData.parts[effectivePartIndex].questions
                                .length
                            }
                            absoluteQuestionNumber={getAbsoluteQuestionNumber(
                              effectivePartIndex,
                              qIndex
                            )}
                            onAnswer={handleAnswer}
                            userAnswer={getUserAnswer(question.id)}
                            isReviewMode={false}
                            examMode={examMode}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Affordability Dialog */}
        <AffordabilityDialog
          isOpen={showAffordabilityDialog}
          onClose={() => setShowAffordabilityDialog(false)}
          featureType={FeaturePricingType.TEST_ANALYSIS_WRITING}
          onProceed={proceedWithSubmit}
          onBuyCredits={() => navigate('/payment')}
          isPending={isSubmitting}
        />
      </div>
    </div>
  );
};

export default WritingExam;
