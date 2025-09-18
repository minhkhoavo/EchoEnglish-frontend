import React from 'react';
import { OverallScoreHeader } from './OverallScoreHeader';
import { PartScoreCard } from './PartScoreCard';
import { TestStatsCard } from './TestStatsCard';
import { ActionButtons } from './ActionButtons';
import type { SpeakingResultPageProps, SpeakingPartResult } from '../types';

export const SpeakingResultOverview: React.FC<SpeakingResultPageProps> = ({
  result,
  stats,
  onTakeAnotherTest,
  onViewDetails,
}) => {
  const handleDownloadReport = () => {
    // Implementation for downloading PDF report
    console.log('Downloading report...');
  };

  const handleShareResult = () => {
    // Implementation for sharing results
    console.log('Sharing result...');
  };

  const handleViewDetailedAnalysis = () => {
    // Implementation for detailed analysis view
    console.log('Viewing detailed analysis...');
  };

  const handleViewRecommendations = () => {
    // Implementation for study recommendations
    console.log('Viewing recommendations...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Overall Score Header */}
        <div className="mb-8">
          <OverallScoreHeader result={result} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Parts Results - Takes most space */}
          <div className="xl:col-span-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Part-by-Part Results
              </h2>
              <p className="text-gray-600">
                Detailed breakdown of your performance in each test section.
                Click the arrow to expand questions.
              </p>
            </div>

            {/* Parts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.parts.map((part: SpeakingPartResult) => (
                <PartScoreCard
                  key={part.partNumber}
                  part={part}
                  onViewDetails={() => onViewDetails?.(part.partNumber)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Stats and Actions */}
          <div className="xl:col-span-1 space-y-6">
            {/* Test Statistics */}
            {stats && <TestStatsCard stats={stats} result={result} />}

            {/* Action Buttons */}
            <ActionButtons
              onTakeAnotherTest={onTakeAnotherTest}
              onDownloadReport={handleDownloadReport}
              onShareResult={handleShareResult}
              onViewDetailedAnalysis={handleViewDetailedAnalysis}
              onViewRecommendations={handleViewRecommendations}
            />
          </div>
        </div>

        {/* Performance Summary Footer */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border-0 p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Performance Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(
                    (result.overallScore / result.maxOverallScore) * 100
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600">Overall Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {
                    result.parts.filter(
                      (p: SpeakingPartResult) => p.score / p.maxScore >= 0.8
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Parts Above 80%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {result.proficiencyLevel}
                </div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Great job!</strong> You've demonstrated{' '}
                {result.proficiencyLevel.toLowerCase()} level speaking skills.
                Continue practicing to reach the next proficiency level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
