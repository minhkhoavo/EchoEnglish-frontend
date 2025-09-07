import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AudioPlayer } from '@/components/AudioPlayer';
import { QuestionNavigation } from '@/features/test/components/QuestionNavigation';
import { Part1Question } from '@/features/test/components/questions/Part1Question';
import { Part2Question } from '@/features/test/components/questions/Part2Question';
import { Part3Question } from '@/features/test/components/questions/Part3Question';
import { Part4Question } from '@/features/test/components/questions/Part4Question';
import { Part5Question } from '@/features/test/components/questions/Part5Question';
import { Part6Question } from '@/features/test/components/questions/Part6Question';
import { Part7Question } from '@/features/test/components/questions/Part7Question';
import axiosInstance from '@/core/api/axios';

interface TestData {
  testId: string;
  testTitle: string;
  resultId: string;
  parts: {
    part1?: {
      partName: string;
      partId: string;
      questions: Array<{
        questionNumber: number;
        questionText: null;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
        media: {
          audioUrl: string;
          imageUrls: string[];
          transcript: string;
          translation?: string;
        };
      }>;
    };
    part2?: {
      partName: string;
      partId: string;
      questions: Array<{
        questionNumber: number;
        questionText: null;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
        media: {
          audioUrl: string;
          transcript: string;
          translation?: string;
        };
      }>;
    };
    part3?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: string;
          transcript: string;
          translation: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: string;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
    part4?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: string;
          transcript: string;
          translation: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: string;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
    part5?: {
      partName: string;
      partId: string;
      questions: Array<{
        questionNumber: number;
        questionText: string;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
        media: {
          audioUrl: null;
          imageUrls: null;
          passageHtml: null;
          transcript: null;
          translation: null;
        };
      }>;
    };
    part6?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: null;
          imageUrls: string[] | null;
          passageHtml: string;
          transcript: string;
          translation: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: null;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
    part7?: {
      partName: string;
      partId: string;
      questionGroups: Array<{
        groupContext: {
          audioUrl: null;
          imageUrls: string[] | null;
          passageHtml: string;
          transcript: string;
          translation?: string;
        };
        questions: Array<{
          questionNumber: number;
          questionText: string;
          options: Array<{ label: string; text: string }>;
          correctAnswer: string;
          userAnswer?: string;
          explanation: string;
        }>;
      }>;
    };
  };
}

const TestExam = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [selectedPart, setSelectedPart] = useState('part1');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestData = async () => {
      if (!testId) return;

      try {
        setLoading(true);

        // Fetch all parts 1-7
        const responses = await Promise.all([
          axiosInstance.get(`/tests/${testId}/part/1`),
          axiosInstance.get(`/tests/${testId}/part/2`),
          axiosInstance.get(`/tests/${testId}/part/3`),
          axiosInstance.get(`/tests/${testId}/part/4`),
          axiosInstance.get(`/tests/${testId}/part/5`),
          axiosInstance.get(`/tests/${testId}/part/6`),
          axiosInstance.get(`/tests/${testId}/part/7`),
        ]);

        const combinedTestData = {
          testId: responses[0].data.testId,
          testTitle: responses[0].data.testTitle,
          resultId: responses[0].data.resultId,
          parts: {
            part1: responses[0].data.parts[0],
            part2: responses[1].data.parts[0],
            part3: responses[2].data.parts[0],
            part4: responses[3].data.parts[0],
            part5: responses[4].data.parts[0],
            part6: responses[5].data.parts[0],
            part7: responses[6].data.parts[0],
          },
        };

        setTestData(combinedTestData);
      } catch (error) {
        console.error('Error fetching test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

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
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-red-500">Unable to load test data</div>
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
                    {testData.parts.part1 && (
                      <Part1Question part={testData.parts.part1} />
                    )}
                  </TabsContent>

                  <TabsContent value="part2" className="mt-0">
                    {testData.parts.part2 && (
                      <Part2Question part={testData.parts.part2} />
                    )}
                  </TabsContent>

                  <TabsContent value="part3" className="mt-0">
                    {testData.parts.part3 && (
                      <Part3Question part={testData.parts.part3} />
                    )}
                  </TabsContent>

                  <TabsContent value="part4" className="mt-0">
                    {testData.parts.part4 && (
                      <Part4Question part={testData.parts.part4} />
                    )}
                  </TabsContent>

                  <TabsContent value="part5" className="mt-0">
                    {testData.parts.part5 && (
                      <Part5Question part={testData.parts.part5} />
                    )}
                  </TabsContent>

                  <TabsContent value="part6" className="mt-0">
                    {testData.parts.part6 && (
                      <Part6Question part={testData.parts.part6} />
                    )}
                  </TabsContent>

                  <TabsContent value="part7" className="mt-0">
                    {testData.parts.part7 && (
                      <Part7Question part={testData.parts.part7} />
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
