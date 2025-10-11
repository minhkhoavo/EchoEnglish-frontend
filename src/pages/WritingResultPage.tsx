import React, { useEffect, useState } from 'react';
import { WritingResultOverview } from '../features/writing-result/components/WritingResultOverview';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetWritingResultByIdQuery } from '@/features/writing-result/services/writingResultApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  transformBackendResult,
  calculateStats,
} from '../features/writing-result/utils/utils';

const WritingResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const id = params.get('id');
  const navigate = useNavigate();
  const [pollingInterval, setPollingInterval] = useState<number>(5000);

  const { data, isFetching, isError } = useGetWritingResultByIdQuery(
    { id: id || '' },
    {
      skip: !id,
      pollingInterval, // Enable RTK Query polling
    }
  );

  // Stop polling when we have scored result
  useEffect(() => {
    if (data?.data) {
      const status = data.data.status;
      if (status === 'scored' || status === 'partially_scored') {
        setPollingInterval(0);
      } else if (status === 'scoring_failed') {
        setPollingInterval(0);
      }
    }
  }, [data]);

  // Handle polling errors
  useEffect(() => {
    if (isError) {
      const timeout = setTimeout(() => setPollingInterval(0), 300000);
      return () => clearTimeout(timeout);
    }
  }, [isError]);

  const handleRetakeTest = () => {
    navigate('/tests');
  };

  const handleViewDetails = (partNumber: number) => {
    // TODO: Implement part details view
  };

  if (!id) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No result ID provided
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Please provide a valid result ID in the URL.
        </p>
        <Button onClick={() => navigate('/tests')}>Go to Tests</Button>
      </div>
    );
  }

  // Show loading while AI is grading (completed status or no data yet)
  if (
    isFetching ||
    (!data?.data && !isError) ||
    (data?.data && data.data.status === 'completed')
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-6 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI is Grading Your Answers
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while our AI analyzes your writing...
          </p>
          {data?.data && data.data.status === 'completed' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-4">
              <p className="font-medium">🔄 Status: Grading in Progress</p>
              <p className="text-xs">Your test is being evaluated by AI</p>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">
              ⏱️ Average grading time: 1-2 minutes
            </p>
            <p className="text-xs text-blue-600">
              The AI is carefully evaluating your writing
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if grading failed completely
  if (data?.data && data.data.status === 'scoring_failed') {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            ❌ Grading Failed
          </h2>
          <p className="text-sm text-red-700 mb-4">
            We encountered an error while grading your writing test. All
            questions failed to be scored. Please try submitting again or
            contact support.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => navigate('/me/tests')} variant="outline">
              View My Attempts
            </Button>
            <Button onClick={() => navigate('/tests')}>
              Take Another Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Grading is taking longer than expected
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The AI grading process is taking longer than usual. Please check back
          later or contact support.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
          <Button onClick={() => navigate('/me/tests')}>
            View My Attempts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/me/tests')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Writing Result
                </h1>
                <p className="text-sm text-gray-600">
                  TOEIC Writing result page with question details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data &&
        (data.data.status === 'scored' ||
          data.data.status === 'partially_scored') && (
          <>
            {data.data.status === 'partially_scored' && (
              <div className="container mx-auto px-4 py-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  <p className="font-medium">⚠️ Partially Scored</p>
                  <p className="text-xs">
                    Some questions could not be graded by AI. The score shown is
                    based on successfully graded questions only.
                  </p>
                </div>
              </div>
            )}
            <WritingResultOverview
              result={transformBackendResult(data.data)}
              stats={calculateStats(transformBackendResult(data.data))}
              onTakeAnotherTest={handleRetakeTest}
              onViewDetails={handleViewDetails}
            />
          </>
        )}
    </div>
  );
};

export default WritingResultPage;
