import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionNavigation } from '@/features/tests/components/lis-read/QuestionNavigation';
import { TestTimer } from '@/features/tests/components/lis-read/TestTimer';
import { Part1Question } from '@/features/tests/components/lis-read/questions/Part1Question';
import { Part2Question } from '@/features/tests/components/lis-read/questions/Part2Question';
import { Part3Question } from '@/features/tests/components/lis-read/questions/Part3Question';
import { Part4Question } from '@/features/tests/components/lis-read/questions/Part4Question';
import { Part5Question } from '@/features/tests/components/lis-read/questions/Part5Question';
import { Part6Question } from '@/features/tests/components/lis-read/questions/Part6Question';
import { Part7Question } from '@/features/tests/components/lis-read/questions/Part7Question';
import { useGetTOEICTestByIdQuery } from '@/features/tests/services/listeningReadingTestAPI';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import { endTest as endTestAction } from '@/features/tests/slices/testSlice';
import type { TestSession } from '@/features/tests/types/toeic-test.types';
import {
  useSubmitTestResultMutation,
  useGetTestResultDetailQuery,
  type SubmitTestResultRequest,
  type TestResultDetail,
} from '@/features/tests/services/testResultAPI';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const TestExam = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { testId } = useParams(); // path param
  const [searchParams] = useSearchParams(); // query params
  const [selectedPart, setSelectedPart] = useState('part1');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingSessionData, setExistingSessionData] = useState<{
    existingSession?: TestSession;
    continueSession?: () => void;
    restartSession?: () => Promise<void>;
  } | null>(null);

  // Review mode states
  const [reviewData, setReviewData] = useState<{
    result: TestResultDetail;
    userAnswers: Record<number, string>;
  } | null>(null);

  // Get test mode and parameters from URL (moved before RTK Query hooks)
  const testMode = searchParams.get('mode') || 'full'; // 'full', 'custom', or 'review'
  const resultId = searchParams.get('resultId'); // for review mode
  const selectedParts = useMemo(
    () => searchParams.get('parts')?.split(',') || [],
    [searchParams]
  );
  const testTime = parseInt(searchParams.get('time') || '120', 10);
  const isHistoryView = searchParams.get('history') === 'true';
  const isReviewMode = testMode === 'review';
  const shouldContinue = searchParams.get('continue') === 'true';
  const isDirectStart = searchParams.get('start') === 'true';

  // RTK Query hooks
  const [submitTestResult] = useSubmitTestResultMutation();
  const { data: reviewResult, isLoading: reviewLoading } =
    useGetTestResultDetailQuery(resultId || '', {
      skip: !isReviewMode || !resultId,
    });

  // Redux-based test session management (moved before useEffect that uses currentSession)
  const { startTest, currentSession, isActive, endTest, updateCurrentSession } =
    useTestSession(isReviewMode);

  // Get user from Redux for userId
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id || 'guest';

  // Handle test submission
  const handleSubmitTest = async () => {
    console.log('🚀 handleSubmitTest called', { currentSession });
    console.log('🔍 testId check:', {
      testId: currentSession?.testId,
      testTitle: currentSession?.testTitle,
      hasAnswers: currentSession?.answers
        ? Object.keys(currentSession.answers).length
        : 0,
    });

    if (currentSession) {
      try {
        // Calculate actual test duration
        const startTime = new Date(currentSession.startTime).getTime();
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Convert answers from currentSession to API format, including timeline if available
        const userAnswers = Object.entries(currentSession.answers).map(
          ([questionNumber, selectedAnswer]) => ({
            questionNumber: parseInt(questionNumber, 10),
            selectedAnswer: selectedAnswer as string,
            answerTimeline: currentSession.answerTimeline
              ? currentSession.answerTimeline[parseInt(questionNumber, 10)]
              : undefined,
          })
        );

        // Prepare submission data
        const submitData: SubmitTestResultRequest = {
          testId: currentSession.testId || testId || '1', // Fallback to testId from URL or default
          testTitle: currentSession.testTitle || 'TOEIC Practice Test',
          testType: 'listening-reading',
          duration,
          startedAt: new Date(currentSession.startTime).getTime(),
          userAnswers,
          parts: Array.isArray(currentSession.selectedParts)
            ? currentSession.selectedParts
            : currentSession.selectedParts
              ? [currentSession.selectedParts]
              : ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7'],
        };

        console.log('📤 Submitting test result:', submitData);

        // Validate critical data before submitting
        if (!submitData.testId) {
          throw new Error('Test ID is missing');
        }
        if (!submitData.userAnswers || submitData.userAnswers.length === 0) {
          throw new Error('No answers to submit');
        }

        // Submit to API using RTK Query
        const result = await submitTestResult(submitData).unwrap();

        // Show success notification
        toast({
          title: 'Test Submitted Successfully!',
          description: result.message,
          variant: 'default',
        });

        console.log('📤 Calling endTest to delete IndexedDB record');
        await endTest();
        console.log('✅ endTest completed, navigating to home');
        navigate('/');
      } catch (error) {
        console.error('❌ Failed to submit test:', error);
        toast({
          title: 'Submission Failed',
          description:
            'There was an error submitting your test. Please try again.',
          variant: 'destructive',
        });
      }
    } else {
      console.log('❌ No current session to submit');
      toast({
        title: 'No Test Session',
        description: 'No active test session found to submit.',
        variant: 'destructive',
      });
    }
  };

  // Handle continuing existing session
  const handleContinueSession = () => {
    if (existingSessionData?.continueSession) {
      existingSessionData.continueSession();
      setShowContinueDialog(false);
      setExistingSessionData(null);
    }
  };

  // Handle restarting new session
  const handleRestartSession = async () => {
    if (existingSessionData?.restartSession) {
      await existingSessionData.restartSession();
      setShowContinueDialog(false);
      setExistingSessionData(null);
    }
  };

  // Get CSS class for grid columns based on parts count
  const getGridColsClass = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      case 7:
        return 'grid-cols-7';
      default:
        return 'grid-cols-7';
    }
  };

  // Determine which parts to show based on mode
  const partsToShow = useMemo(() => {
    if (isReviewMode && reviewResult?.parts && reviewResult.parts.length > 0) {
      // In review mode, use the partKeys from the test result collection
      return reviewResult.parts;
    }
    const showAllParts = testMode === 'full' || selectedParts.length === 0;
    return showAllParts
      ? ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7']
      : selectedParts;
  }, [testMode, selectedParts, isReviewMode, reviewResult?.parts]);

  // Set initial part based on available parts
  useEffect(() => {
    if (partsToShow.length > 0 && !partsToShow.includes(selectedPart)) {
      setSelectedPart(partsToShow[0]);
    }
  }, [partsToShow, selectedPart]);

  // Use RTK Query hook instead of manual fetch
  const {
    data: testData,
    isLoading: loading,
    error,
  } = useGetTOEICTestByIdQuery(testId || reviewResult?.testId || '', {
    skip: !testId && (!isReviewMode || !reviewResult?.testId),
  });

  // Load review data when in review mode
  useEffect(() => {
    if (isReviewMode && reviewResult) {
      // Convert userAnswers array to object for easy lookup
      const userAnswersMap: Record<number, string> = {};
      reviewResult.userAnswers.forEach((answer) => {
        userAnswersMap[answer.questionNumber] = answer.selectedAnswer;
      });

      setReviewData({
        result: reviewResult,
        userAnswers: userAnswersMap,
      });
    }
  }, [isReviewMode, reviewResult]); // Initialize test session when test data is loaded and not in history view or review mode
  useEffect(() => {
    if (
      testData &&
      !isHistoryView &&
      !isReviewMode &&
      !isActive &&
      (!isDirectStart || shouldContinue)
    ) {
      const timeLimit = testTime * 60 * 1000; // Convert minutes to milliseconds

      const initializeTest = async () => {
        console.log('TestExam initialization:', {
          testMode,
          selectedParts,
          shouldContinue,
          isDirectStart,
          testTime,
        });

        if (shouldContinue) {
          // Continue existing session - session should already exist from previous navigation
          const result = await startTest(
            testData,
            timeLimit,
            testMode as 'full' | 'custom',
            selectedParts
          );

          if (result.hasExisting) {
            result.continueSession?.();
          }
        } else {
          // Check for existing session first
          const result = await startTest(
            testData,
            timeLimit,
            testMode as 'full' | 'custom',
            selectedParts
          );

          if (result.hasExisting) {
            // Show dialog to user
            setExistingSessionData(result);
            setShowContinueDialog(true);
          }
        }
      };

      initializeTest();
    }
  }, [
    testData,
    isHistoryView,
    isReviewMode,
    isActive,
    testTime,
    testMode,
    selectedParts,
    shouldContinue,
    isDirectStart,
    startTest,
    userId,
  ]);

  // Clear session if testMode changes (user switches between full/custom in same test)
  useEffect(() => {
    if (currentSession && currentSession.testMode !== testMode) {
      // Don't use endTest here as it will clean up IndexedDB
      // Just clear the Redux state
      dispatch(endTestAction());
    }
  }, [testMode, currentSession, dispatch]);

  // Cleanup Redux state when leaving TestExam page to prevent unwanted auto-save
  useEffect(() => {
    return () => {
      dispatch(endTestAction());
    };
  }, [dispatch]);

  // Đã dùng formatMs dùng chung

  const handleBackToTests = async () => {
    // Update savedAt và timeRemaining trước khi exit nếu đang làm bài
    if (currentSession) {
      try {
        // Tính timeRemaining dựa trên thời gian đã trôi qua từ lúc bắt đầu
        const startTime = new Date(currentSession.startTime).getTime();
        const elapsed = Date.now() - startTime;
        const newTimeRemaining = Math.max(
          0,
          currentSession.timeRemaining - elapsed
        );

        await updateCurrentSession({
          savedAt: new Date().toISOString(),
          timeRemaining: newTimeRemaining,
        });
      } catch (error) {
        console.error('Failed to update savedAt/timeRemaining on exit:', error);
      }
    }
    navigate('/');
  };

  const jumpToQuestion = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    // Determine which part based on question number and switch to appropriate tab
    if (questionNumber <= 6) setSelectedPart('part1');
    else if (questionNumber <= 31) setSelectedPart('part2');
    else if (questionNumber <= 70) setSelectedPart('part3');
    else if (questionNumber <= 100) setSelectedPart('part4');
    else if (questionNumber <= 130) setSelectedPart('part5');
    else if (questionNumber <= 146) setSelectedPart('part6');
    else setSelectedPart('part7');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading test...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-red-500">
          Error loading test:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-red-500">Test not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            {isReviewMode ? (
              // In review mode, no confirmation needed
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleBackToTests}
              >
                <ArrowLeft className="h-4 w-4" />
                Exit
              </Button>
            ) : (
              // In test mode, show confirmation dialog
              <ConfirmationDialog
                title="Exit Test"
                description="Are you sure you want to exit the test? Your progress will be saved."
                confirmText="Exit"
                cancelText="Continue"
                variant="default"
                onConfirm={handleBackToTests}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Exit
                </Button>
              </ConfirmationDialog>
            )}
            <h1 className="text-2xl font-bold text-foreground">
              {isReviewMode
                ? `Review: ${reviewData?.result.testTitle || 'Test Result'}`
                : testData.testTitle}
            </h1>
            {testMode === 'custom' && (
              <span className="text-sm text-muted-foreground">
                ({partsToShow.length} parts - {testTime} minutes)
              </span>
            )}
            {isReviewMode && reviewData && (
              <span className="text-sm text-muted-foreground">
                Score: {reviewData.result.score}/
                {reviewData.result.totalQuestions} (
                {reviewData.result.percentage}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Test Timer - only show in active test mode */}
            {!isHistoryView && !isReviewMode && <TestTimer />}

            {/* Submit Test Button - only show in active test mode */}
            {!isHistoryView && !isReviewMode && (
              <ConfirmationDialog
                title="Submit Test"
                description="Are you sure you want to submit your test?"
                confirmText="Submit"
                cancelText="Continue"
                variant="default"
                onConfirm={handleSubmitTest}
              >
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Submit
                </Button>
              </ConfirmationDialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[calc(100vh-140px)]">
          {/* Main Content - Wider area */}
          <div className="lg:col-span-4">
            <div
              className="h-[calc(100vh-105px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pr-4 scroll-smooth bg-white dark:bg-gray-900 rounded-lg border shadow-sm"
              data-testid="main-scroll-container"
            >
              <Tabs value={selectedPart} onValueChange={setSelectedPart}>
                <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10 p-4 border-b border-border/50">
                  <TabsList
                    className={`grid w-full ${getGridColsClass(partsToShow.length)}`}
                  >
                    {partsToShow.includes('part1') && (
                      <TabsTrigger value="part1">Part 1</TabsTrigger>
                    )}
                    {partsToShow.includes('part2') && (
                      <TabsTrigger value="part2">Part 2</TabsTrigger>
                    )}
                    {partsToShow.includes('part3') && (
                      <TabsTrigger value="part3">Part 3</TabsTrigger>
                    )}
                    {partsToShow.includes('part4') && (
                      <TabsTrigger value="part4">Part 4</TabsTrigger>
                    )}
                    {partsToShow.includes('part5') && (
                      <TabsTrigger value="part5">Part 5</TabsTrigger>
                    )}
                    {partsToShow.includes('part6') && (
                      <TabsTrigger value="part6">Part 6</TabsTrigger>
                    )}
                    {partsToShow.includes('part7') && (
                      <TabsTrigger value="part7">Part 7</TabsTrigger>
                    )}
                  </TabsList>
                </div>

                <div className="p-6">
                  {partsToShow.includes('part1') && (
                    <TabsContent value="part1" className="mt-0">
                      {testData?.parts[0] && (
                        <Part1Question
                          part={testData.parts[0]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part2') && (
                    <TabsContent value="part2" className="mt-0">
                      {testData?.parts[1] && (
                        <Part2Question
                          part={testData.parts[1]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part3') && (
                    <TabsContent value="part3" className="mt-0">
                      {testData?.parts[2] && (
                        <Part3Question
                          part={testData.parts[2]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part4') && (
                    <TabsContent value="part4" className="mt-0">
                      {testData?.parts[3] && (
                        <Part4Question
                          part={testData.parts[3]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part5') && (
                    <TabsContent value="part5" className="mt-0">
                      {testData?.parts[4] && (
                        <Part5Question
                          part={testData.parts[4]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part6') && (
                    <TabsContent value="part6" className="mt-0">
                      {testData?.parts[5] && (
                        <Part6Question
                          part={testData.parts[5]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part7') && (
                    <TabsContent value="part7" className="mt-0">
                      {testData?.parts[6] && (
                        <Part7Question
                          part={testData.parts[6]}
                          showCorrectAnswers={isHistoryView || isReviewMode}
                          userAnswers={
                            isReviewMode ? reviewData?.userAnswers : undefined
                          }
                          reviewAnswers={
                            isReviewMode
                              ? reviewData?.result.userAnswers
                              : undefined
                          }
                        />
                      )}
                    </TabsContent>
                  )}
                </div>

                {/* Bottom padding for smooth scrolling */}
                <div className="h-16"></div>
              </Tabs>
            </div>
          </div>

          {/* Question Navigation - Narrower, fixed sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <QuestionNavigation
                currentQuestion={currentQuestion}
                onQuestionSelect={jumpToQuestion}
                testData={testData}
                showParts={partsToShow}
                isHistoryView={isHistoryView || isReviewMode}
                userAnswers={
                  isReviewMode
                    ? reviewData?.userAnswers || {}
                    : currentSession?.answers || {}
                }
                reviewAnswers={
                  isReviewMode ? reviewData?.result.userAnswers : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestExam;
