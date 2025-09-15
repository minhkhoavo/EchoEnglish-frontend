import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, BookOpen, Headphones, ArrowLeft } from 'lucide-react';
import { TestHistory } from './TestHistory';
import { ContinueTestDialog } from './ContinueTestDialog';
import { useTestSession } from '../hooks/useTestSession';
import { useGetTOEICTestByIdQuery } from '../services/listeningReadingTestAPI';
import type { TestSession } from '../types/toeic-test.types';

interface TestPart {
  id: string;
  name: string;
  questions: number;
  type: 'listening' | 'reading';
}

const testParts: TestPart[] = [
  { id: 'part1', name: 'PART 1', questions: 6, type: 'listening' },
  { id: 'part2', name: 'PART 2', questions: 25, type: 'listening' },
  { id: 'part3', name: 'PART 3', questions: 39, type: 'listening' },
  { id: 'part4', name: 'PART 4', questions: 30, type: 'listening' },
  { id: 'part5', name: 'PART 5', questions: 30, type: 'reading' },
  { id: 'part6', name: 'PART 6', questions: 16, type: 'reading' },
  { id: 'part7', name: 'PART 7', questions: 54, type: 'reading' },
];

const timeOptions = [
  { value: '5', label: '5 phút' },
  { value: '10', label: '10 phút' },
  { value: '15', label: '15 phút' },
  { value: '30', label: '30 phút' },
  { value: '45', label: '45 phút' },
  { value: '60', label: '60 phút' },
  { value: '90', label: '90 phút' },
  { value: '120', label: '120 phút' },
];

interface ToeicTestDetailProps {
  testId?: string;
  onBack?: () => void;
}

export const ToeicTestDetail = ({ testId, onBack }: ToeicTestDetailProps) => {
  const navigate = useNavigate();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [customTime, setCustomTime] = useState('30');

  // Dialog state for session continuation
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [existingSession, setExistingSession] = useState<TestSession | null>(
    null
  );
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  const { checkExistingSession, startTest, forceStartFresh } = useTestSession();

  // Get test data for session creation
  const { data: testData } = useGetTOEICTestByIdQuery(testId || '', {
    skip: !testId,
  });

  const handlePartToggle = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId]
    );
  };

  const listeningParts = testParts.filter((part) => part.type === 'listening');
  const readingParts = testParts.filter((part) => part.type === 'reading');

  const selectedPartsData = testParts.filter((part) =>
    selectedParts.includes(part.id)
  );
  const totalQuestions = selectedPartsData.reduce(
    (sum, part) => sum + part.questions,
    0
  );

  const handleStartTest = async () => {
    if (!testId) return;

    let targetUrl: string;
    let testMode: 'full' | 'custom';
    let partsToCheck: string[] | undefined;

    if (isCustomMode && selectedParts.length > 0) {
      // Custom mode with selected parts
      testMode = 'custom';
      partsToCheck = selectedParts;
      const partsParam = selectedParts.join(',');
      targetUrl = `/test-exam/${testId}?parts=${partsParam}&time=${customTime}&mode=custom`;
    } else {
      // Full test mode
      testMode = 'full';
      partsToCheck = undefined;
      targetUrl = `/test-exam/${testId}?mode=full&time=120`;
    }

    // Check for existing session with the specific test configuration
    try {
      console.log('TOEICTestDetail checking session:', {
        testId,
        testMode,
        partsToCheck,
        isCustomMode,
        selectedParts,
      });

      const existingSessionData = await checkExistingSession(
        testId,
        testMode,
        partsToCheck
      );

      if (existingSessionData) {
        // Show dialog asking user what to do
        setExistingSession(existingSessionData);
        setPendingNavigation(targetUrl);
        setShowContinueDialog(true);
      } else {
        // No existing session, create new session and navigate
        if (testData) {
          const timeLimit =
            (testMode === 'custom' ? parseInt(customTime || '30', 10) : 120) *
            60 *
            1000;
          await startTest(testData, timeLimit, testMode, partsToCheck);
        }
        navigate(targetUrl + '&start=true');
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
      // If error occurs, proceed with navigation anyway
      navigate(targetUrl);
    }
  };

  const handleContinueSession = () => {
    setShowContinueDialog(false);
    if (pendingNavigation) {
      // Navigate without continue parameter, the TestExam will handle continue logic
      navigate(pendingNavigation + '&continue=true');
    }
  };

  const handleRestartSession = async () => {
    setShowContinueDialog(false);

    if (testData && existingSession) {
      try {
        // Get the test mode and selectedParts from the existing session
        const testMode = existingSession.testMode as 'full' | 'custom';
        const sessionParts =
          typeof existingSession.selectedParts === 'string'
            ? existingSession.selectedParts.split('-')
            : existingSession.selectedParts || [];

        // Calculate time limit (convert minutes to milliseconds)
        const timeInMinutes =
          testMode === 'custom' ? parseInt(customTime || '30', 10) : 120;
        const timeLimit = timeInMinutes * 60 * 1000;

        // Force start fresh session directly
        await forceStartFresh(testData, timeLimit, testMode, sessionParts);

        // Navigate without restart parameter
        if (pendingNavigation) {
          navigate(pendingNavigation);
        }
      } catch (error) {
        console.error('❌ Failed to restart session:', error);
        // Fallback: navigate anyway
        if (pendingNavigation) {
          navigate(pendingNavigation);
        }
      }
    }
  };

  const handleCancelSession = () => {
    setShowContinueDialog(false);
    setPendingNavigation(null);
    setExistingSession(null);
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
          TOEIC Practice Test - 2 Skills
        </h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Test duration: 2 hours</span>
          </div>
        </div>
      </div>

      {/* Test Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Test Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Listening Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  LISTENING
                </h3>
              </div>
              <div className="space-y-2">
                {listeningParts.map((part) => (
                  <div
                    key={part.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedParts.includes(part.id)
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-part-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCustomMode && (
                        <Checkbox
                          checked={selectedParts.includes(part.id)}
                          onCheckedChange={() => handlePartToggle(part.id)}
                        />
                      )}
                      <span className="font-medium">{part.name}</span>
                    </div>
                    <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                      {part.questions} QUESTIONS
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-semibold text-secondary">
                  READING
                </h3>
              </div>
              <div className="space-y-2">
                {readingParts.map((part) => (
                  <div
                    key={part.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedParts.includes(part.id)
                        ? 'bg-secondary/5 border-secondary'
                        : 'hover:bg-part-hover'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isCustomMode && (
                        <Checkbox
                          checked={selectedParts.includes(part.id)}
                          onCheckedChange={() => handlePartToggle(part.id)}
                        />
                      )}
                      <span className="font-medium">{part.name}</span>
                    </div>
                    <span className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {part.questions} QUESTIONS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Mode Toggle */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Checkbox
                id="custom-mode"
                checked={isCustomMode}
                onCheckedChange={(checked) => setIsCustomMode(checked === true)}
              />
              <label
                htmlFor="custom-mode"
                className="font-medium cursor-pointer"
              >
                Select parts
              </label>
            </div>

            {/* Time Selection for Custom Mode */}
            {isCustomMode && (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Time:</span>
                <Select value={customTime} onValueChange={setCustomTime}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected Parts Summary */}
            {isCustomMode && selectedParts.length > 0 && (
              <div className="bg-accent/10 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-accent-foreground">
                  Selected: {selectedParts.length} part(s) - {totalQuestions}{' '}
                  questions - {customTime} minutes
                </p>
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStartTest}
              size="lg"
              className="w-full md:w-auto px-8 py-3 text-lg font-semibold"
              disabled={isCustomMode && selectedParts.length === 0}
            >
              START
            </Button>
          </div>
        </CardContent>
      </Card>

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
          timeElapsed={`${Math.floor((Date.now() - Number(existingSession.startTime)) / (1000 * 60))} min`}
          answeredQuestions={Object.keys(existingSession.answers).length}
          totalQuestions={200}
          onContinue={handleContinueSession}
          onRestart={handleRestartSession}
          onCancel={handleCancelSession}
        />
      )}
    </div>
  );
};
