import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetWritingTestByIdQuery } from '@/features/tests/services/writingTestApi';
import { useAppDispatch, useAppSelector } from '@/core/store/store';
import {
  setWritingExamMode,
  resetWritingExam,
} from '@/features/tests/slices/writingExamSlice';
import { ArrowLeft, Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

const WritingModeSelection: React.FC = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { examMode } = useAppSelector((state) => state.writingExam);

  const {
    data: testData,
    error: testError,
    isLoading: isLoadingTest,
  } = useGetWritingTestByIdQuery(testId!);

  const handleStartTest = () => {
    navigate(`/test/writing/${testId}/exam`);
  };

  if (isLoadingTest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading test...</span>
        </div>
      </div>
    );
  }

  if (testError || !testData) {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Writing Test Setup
              </h1>
              <p className="text-sm text-muted-foreground">
                {testData.testTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Test Mode</CardTitle>
              <CardDescription>
                Choose how you want to take the writing test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Test Mode Selection */}
              <div className="grid grid-cols-1 gap-3">
                {/* Practice Mode */}
                <Card
                  className={`cursor-pointer transition-all ${
                    examMode === 'practice'
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    dispatch(setWritingExamMode('practice'));
                    dispatch(resetWritingExam());
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            examMode === 'practice'
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {examMode === 'practice' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <h5 className="font-medium">Practice Mode</h5>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Navigate freely between parts, unlimited time, see
                          sample answers and ideas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Exam Mode */}
                <Card
                  className={`cursor-pointer transition-all ${
                    examMode === 'exam'
                      ? 'ring-2 ring-red-500 bg-red-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    dispatch(setWritingExamMode('exam'));
                    dispatch(resetWritingExam());
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            examMode === 'exam'
                              ? 'bg-red-500 border-red-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {examMode === 'exam' && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-red-600" />
                          <h5 className="font-medium">Real Exam Mode</h5>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div>• Part 1: 8 minutes (5 questions)</div>
                          <div>• Part 2: 20 minutes (2 questions)</div>
                          <div>• Part 3: 32 minutes (1 question)</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Information</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Total time: 60 minutes</p>
                  <p>• {testData.number_of_questions} questions</p>
                  <p>• {testData.number_of_parts} parts</p>
                </div>
              </div>

              {/* Start Button */}
              <Button onClick={handleStartTest} className="w-full" size="lg">
                Start {examMode === 'exam' ? 'Real Exam' : 'Practice'} Test
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {examMode === 'exam'
                  ? 'Timed test with automatic progression'
                  : 'Practice at your own pace with unlimited time'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WritingModeSelection;
