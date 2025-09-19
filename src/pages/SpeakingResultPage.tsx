import React from 'react';
import { SpeakingResultOverview } from '../features/speaking-result/components/SpeakingResultOverview';
import { useSearchParams } from 'react-router-dom';
import { useGetSpeakingResultByIdQuery } from '@/features/speaking-result/services/speakingResultApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpeakingResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const id = params.get('id') || '68c8324365d8ff761513fee4';
  const { data, isFetching, isError } = useGetSpeakingResultByIdQuery({ id });
  const navigate = useNavigate();

  const handleRetakeTest = () => {
    console.log('Retaking test...');
    navigate('/tests');
  };

  const handleViewDetails = (partNumber: number) => {
    console.log(`Viewing details for part ${partNumber}`);
    // Navigate to detailed part analysis
  };

  if (isFetching) {
    return <div className="p-8 text-center text-gray-600">Loading…</div>;
  }

  if (isError || !data) {
    // API failed — show fallback UI and link to demo page
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load speaking result
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          There was a problem fetching the speaking result. You can try
          reloading, check your network connection, or view the demo result.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
          <Button onClick={() => navigate('/speaking-result/demo')}>
            Open demo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden  ">
      {/* Demo Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Speaking Result
                </h1>
                <p className="text-sm text-gray-600">
                  TOEIC Speaking result page with question details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SpeakingResultOverview
        result={data.result}
        stats={data.stats}
        onTakeAnotherTest={handleRetakeTest}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default SpeakingResultPage;
