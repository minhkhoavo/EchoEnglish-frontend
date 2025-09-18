import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, ArrowLeft } from 'lucide-react';
import { TestHistory } from './TestHistory';
import { ContinueTestDialog } from './ContinueTestDialog';
import { TestStructure } from './TestStructure';
import { useTestSessionManagement } from '@/features/tests/hooks/useTestSessionManagement';
import { useGetTOEICTestByIdQuery } from '@/features/tests/services/listeningReadingTestAPI';

interface ToeicTestDetailProps {
  testId?: string;
  onBack?: () => void;
}

export const ToeicTestDetail = ({ testId, onBack }: ToeicTestDetailProps) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState('30');

  // Get test data for session creation
  const { data: testData } = useGetTOEICTestByIdQuery(testId || '', {
    skip: !testId, // Skip query if no testId
  });

  // Test session management
  const {
    showContinueDialog,
    existingSession,
    handleStartTest,
    handleContinueSession,
    handleRestartSession,
    handleCancelSession,
  } = useTestSessionManagement(testId, testData);

  const handlePartToggle = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const startTest = () => {
    handleStartTest(isCustomMode, selectedParts, customTime);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      {onBack && (
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tests
          </Button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {testData?.testTitle || 'TOEIC Practice Test - 2 Skills'}
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              Test duration:{' '}
              {isCustomMode
                ? `${customTime} minute${customTime === '1' ? '' : 's'}`
                : '2 hours'}
            </span>
          </div>
        </div>
      </div>

      {/* Test Structure */}
      <TestStructure
        selectedParts={selectedParts}
        isCustomMode={isCustomMode}
        customTime={customTime}
        onPartToggle={handlePartToggle}
        onCustomModeChange={setIsCustomMode}
        onTimeChange={setCustomTime}
        onStartTest={startTest}
      />

      {/* Test History */}
      <TestHistory />

      {/* Continue Test Dialog */}
      {showContinueDialog && existingSession && (
        <ContinueTestDialog
          isOpen={showContinueDialog}
          testTitle={existingSession.testTitle || 'TOEIC Practice Test'}
          progress={Math.round(
            (Object.keys(existingSession.answers).length / 200) * 100
          )}
          timeRemaining={
            typeof existingSession.timeRemaining === 'number'
              ? existingSession.timeRemaining
              : 0
          }
          numberOfAnsweredQuestions={
            Object.keys(existingSession.answers).length
          }
          totalQuestions={200}
          onContinue={handleContinueSession}
          onRestart={() => handleRestartSession(customTime)}
          onCancel={handleCancelSession}
        />
      )}
    </div>
  );
};
