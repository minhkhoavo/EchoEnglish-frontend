import React from 'react';
import { SpeakingResultOverview } from '../features/speaking-result/components/SpeakingResultOverview';
import {
  mockSpeakingResult,
  mockSpeakingStats,
} from '../features/speaking-result/data/mockData';

const SpeakingResultPage: React.FC = () => {
  const handleRetakeTest = () => {
    console.log('Retaking test...');
    // Navigate to test page or show test selection
  };

  const handleViewDetails = (partNumber: number) => {
    console.log(`Viewing details for part ${partNumber}`);
    // Navigate to detailed part analysis
  };

  return (
    <SpeakingResultOverview
      result={mockSpeakingResult}
      stats={mockSpeakingStats}
      onRetakeTest={handleRetakeTest}
      onViewDetails={handleViewDetails}
    />
  );
};

export default SpeakingResultPage;
