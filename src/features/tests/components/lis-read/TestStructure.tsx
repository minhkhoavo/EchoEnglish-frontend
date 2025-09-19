import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones, BookOpen } from 'lucide-react';
import { TestPartList } from './TestPartList';
import { CustomModeControls } from './CustomModeControls';
import { getPartsByType } from '@/features/tests/constants/testConstants';

interface TestStructureProps {
  selectedParts: string[];
  isCustomMode: boolean;
  customTime: string;
  onPartToggle: (partId: string) => void;
  onCustomModeChange: (checked: boolean) => void;
  onTimeChange: (time: string) => void;
  onStartTest: () => void;
}

export const TestStructure: React.FC<TestStructureProps> = ({
  selectedParts,
  isCustomMode,
  customTime,
  onPartToggle,
  onCustomModeChange,
  onTimeChange,
  onStartTest,
}) => {
  const listeningParts = getPartsByType('listening');
  const readingParts = getPartsByType('reading');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Test Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Listening Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">LISTENING</h3>
            </div>
            <TestPartList
              parts={listeningParts}
              selectedParts={selectedParts}
              isCustomMode={isCustomMode}
              onPartToggle={onPartToggle}
              colorClass="bg-primary"
              borderClass="border-primary"
            />
          </div>

          {/* Reading Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-semibold text-secondary">READING</h3>
            </div>
            <TestPartList
              parts={readingParts}
              selectedParts={selectedParts}
              isCustomMode={isCustomMode}
              onPartToggle={onPartToggle}
              colorClass="bg-secondary"
              borderClass="border-secondary"
            />
          </div>
        </div>

        {/* Custom Mode Controls */}
        <CustomModeControls
          isCustomMode={isCustomMode}
          selectedParts={selectedParts}
          customTime={customTime}
          onCustomModeChange={onCustomModeChange}
          onTimeChange={onTimeChange}
          onStartTest={onStartTest}
        />
      </CardContent>
    </Card>
  );
};
