import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const TestExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [selectedPart, setSelectedPart] = useState('part1');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds

  // Get test mode and parameters from URL
  const testMode = searchParams.get('mode') || 'full'; // 'full' or 'custom'
  const selectedParts = useMemo(
    () => searchParams.get('parts')?.split(',') || [],
    [searchParams]
  );
  const testTime = parseInt(searchParams.get('time') || '120', 10);
  const isHistoryView = searchParams.get('history') === 'true';
  const shouldContinue = searchParams.get('continue') === 'true';
  const isDirectStart = searchParams.get('start') === 'true';

  // Redux-based test session management (moved before useEffect that uses currentSession)
  const { startTest, currentSession, isActive, endTest } = useTestSession();

  // Get user from Redux for userId
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id || 'guest';

  // Initialize timer based on test time
  useEffect(() => {
    if (!isHistoryView && testTime > 0) {
      const initialTime = testTime * 60; // Convert minutes to seconds
      setTimeRemaining(initialTime);
    }
  }, [testTime, isHistoryView]);

  // Timer countdown
  useEffect(() => {
    if (!isHistoryView && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto-submit when time expires
            if (currentSession) {
              endTest().then(() => {
                navigate('/tests?completed=true');
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isHistoryView, currentSession, endTest, navigate]);

  // Handle test submission
  const handleSubmitTest = async () => {
    if (currentSession) {
      await endTest();
      navigate('/tests?completed=true');
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
    const showAllParts = testMode === 'full' || selectedParts.length === 0;
    return showAllParts
      ? ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'part7']
      : selectedParts;
  }, [testMode, selectedParts]);

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
  } = useGetTOEICTestByIdQuery(testId || '', {
    skip: !testId,
  });

  // Initialize test session when test data is loaded and not in history view
  useEffect(() => {
    if (
      testData &&
      !isHistoryView &&
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
          // Normal test start
          await startTest(
            testData,
            timeLimit,
            testMode as 'full' | 'custom',
            selectedParts
          );
        }
      };

      initializeTest();
    }
  }, [
    testData,
    isHistoryView,
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
      console.log('🔄 TestMode changed, clearing incompatible session:', {
        currentSessionMode: currentSession.testMode,
        newTestMode: testMode,
        testId: currentSession.testId,
      });
      // Don't use endTest here as it will clean up IndexedDB
      // Just clear the Redux state
      dispatch(endTestAction());
    }
  }, [testMode, currentSession, dispatch]);

  const handleBackToTests = () => {
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTests}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              {testData.testTitle}
            </h1>
            {testMode === 'custom' && (
              <span className="text-sm text-muted-foreground">
                ({partsToShow.length} parts - {testTime} minutes)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Test Timer */}
            {!isHistoryView && <TestTimer timeRemaining={timeRemaining} />}

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
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
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part2') && (
                    <TabsContent value="part2" className="mt-0">
                      {testData?.parts[1] && (
                        <Part2Question
                          part={testData.parts[1]}
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part3') && (
                    <TabsContent value="part3" className="mt-0">
                      {testData?.parts[2] && (
                        <Part3Question
                          part={testData.parts[2]}
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part4') && (
                    <TabsContent value="part4" className="mt-0">
                      {testData?.parts[3] && (
                        <Part4Question
                          part={testData.parts[3]}
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part5') && (
                    <TabsContent value="part5" className="mt-0">
                      {testData?.parts[4] && (
                        <Part5Question
                          part={testData.parts[4]}
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part6') && (
                    <TabsContent value="part6" className="mt-0">
                      {testData?.parts[5] && (
                        <Part6Question
                          part={testData.parts[5]}
                          showCorrectAnswers={isHistoryView}
                        />
                      )}
                    </TabsContent>
                  )}

                  {partsToShow.includes('part7') && (
                    <TabsContent value="part7" className="mt-0">
                      {testData?.parts[6] && (
                        <Part7Question
                          part={testData.parts[6]}
                          showCorrectAnswers={isHistoryView}
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
                isHistoryView={isHistoryView}
                userAnswers={currentSession?.answers || {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestExam;
