import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { OverallScoreHeader } from './OverallScoreHeader';
import { PartScoreCard } from './PartScoreCard';
import { TestStatsCard } from './TestStatsCard';
import type {
  WritingResultPageProps,
  WritingPartResult,
} from '../types/writing-result.types';

export const WritingResultOverview: React.FC<WritingResultPageProps> = ({
  result,
  stats,
  onTakeAnotherTest,
}) => {
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Safety check for result data
  if (!result || !result.parts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">No result data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Overall Score Header */}
        <div className="mb-8">
          <OverallScoreHeader result={result} />
        </div>

        {/* Test Statistics */}
        <div className="mb-8">
          {stats && <TestStatsCard stats={stats} result={result} />}
        </div>

        {/* Show/Hide All Details Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Part-by-Part Results
            </h2>
            <p className="text-gray-600">
              Detailed breakdown of your performance in each test section
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="flex items-center gap-2"
          >
            {showAllDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide All Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All Details
              </>
            )}
          </Button>
        </div>

        {/* Parts Results - Full Width */}
        <div className="space-y-6 mb-8">
          {result.parts.map((part: WritingPartResult) => (
            <PartScoreCard
              key={part.partNumber}
              part={part}
              showAllDetails={showAllDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
