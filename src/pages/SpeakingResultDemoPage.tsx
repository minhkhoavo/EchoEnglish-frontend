import React from 'react';
import { SpeakingResultOverview } from '../features/speaking-result/components/SpeakingResultOverview';
import {
  mockSpeakingResult,
  mockSpeakingStats,
} from '../features/speaking-result/data/mockData';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SpeakingResultDemoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRetakeTest = () => {
    alert('This would navigate to the test page');
  };

  const handleViewDetails = (partNumber: number) => {
    alert(`This would show detailed analysis for Part ${partNumber}`);
  };

  const handleAnalyzeQuestion = (questionId: number) => {
    alert(`This would navigate to speech-analyzer for Question ${questionId}`);
    // In real app: navigate(`/speech/recordings/${questionId}`);
  };

  return (
    <div className="min-h-screen">
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
                  Speaking Result Demo
                </h1>
                <p className="text-sm text-gray-600">
                  Professional TOEIC Speaking result page with question details
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <SpeakingResultOverview
        result={mockSpeakingResult}
        stats={mockSpeakingStats}
        onRetakeTest={handleRetakeTest}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default SpeakingResultDemoPage;
