import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuestionNavigation } from '@/features/tests/components/lis-read/QuestionNavigation';
import { Part1Question } from '@/features/tests/components/lis-read/questions/Part1Question';
import { Part2Question } from '@/features/tests/components/lis-read/questions/Part2Question';
import { Part3Question } from '@/features/tests/components/lis-read/questions/Part3Question';
import { Part4Question } from '@/features/tests/components/lis-read/questions/Part4Question';
import { Part5Question } from '@/features/tests/components/lis-read/questions/Part5Question';
import { Part6Question } from '@/features/tests/components/lis-read/questions/Part6Question';
import { Part7Question } from '@/features/tests/components/lis-read/questions/Part7Question';
import { useGetTOEICTestByIdQuery } from '@/features/tests/services/listeningReadingTestAPI';

const TestExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState('part1');
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // Use RTK Query hook instead of manual fetch
  const {
    data: testData,
    isLoading: loading,
    error,
  } = useGetTOEICTestByIdQuery(testId || '', {
    skip: !testId,
  });

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
          </div>

          <div className="flex items-center gap-2">
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
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="part1">Part 1</TabsTrigger>
                    <TabsTrigger value="part2">Part 2</TabsTrigger>
                    <TabsTrigger value="part3">Part 3</TabsTrigger>
                    <TabsTrigger value="part4">Part 4</TabsTrigger>
                    <TabsTrigger value="part5">Part 5</TabsTrigger>
                    <TabsTrigger value="part6">Part 6</TabsTrigger>
                    <TabsTrigger value="part7">Part 7</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="part1" className="mt-0">
                    {testData?.parts[0] && (
                      <Part1Question part={testData.parts[0]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part2" className="mt-0">
                    {testData?.parts[1] && (
                      <Part2Question part={testData.parts[1]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part3" className="mt-0">
                    {testData?.parts[2] && (
                      <Part3Question part={testData.parts[2]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part4" className="mt-0">
                    {testData?.parts[3] && (
                      <Part4Question part={testData.parts[3]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part5" className="mt-0">
                    {testData?.parts[4] && (
                      <Part5Question part={testData.parts[4]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part6" className="mt-0">
                    {testData?.parts[5] && (
                      <Part6Question part={testData.parts[5]} />
                    )}
                  </TabsContent>

                  <TabsContent value="part7" className="mt-0">
                    {testData?.parts[6] && (
                      <Part7Question part={testData.parts[6]} />
                    )}
                  </TabsContent>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestExam;
