import React from 'react';
import type {
  SpeakingOverallResult,
  SpeakingResultStats,
} from '../features/speaking-result/types';
import { SpeakingResultOverview } from '../features/speaking-result/components/SpeakingResultOverview';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Inlined mock data for demo page only (moved from shared mockData)
const mockSpeakingResult: SpeakingOverallResult = {
  overallScore: 156,
  maxOverallScore: 200,
  proficiencyLevel: 'Advanced',
  testDate: '2024-03-15T10:30:00Z',
  testDuration: 20,
  testTitle: 'TOEIC Speaking Practice Test #1',
  completionRate: 95,
  parts: [],
};

const mockSpeakingStats: SpeakingResultStats = {
  totalQuestions: 11,
  answeredQuestions: 11,
  averageResponseTime: 45,
  totalRecordingTime: 720,
};

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
        onTakeAnotherTest={handleRetakeTest}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default SpeakingResultDemoPage;
