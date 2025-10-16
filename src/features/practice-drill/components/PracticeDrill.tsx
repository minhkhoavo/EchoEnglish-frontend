import { PracticeDrillViewer } from './PracticeDrillViewer';
import type { WeaknessDrill } from '../../lr-analyze/types/analysis';

interface DrillConfig {
  minScore?: number;
  isRetryable?: boolean;
  maxAttempts?: number;
  sessionId?: string;
}

interface SimplePracticeDrillDemoProps {
  questionIds?: string[];
  drillData?: WeaknessDrill;
  drillConfig?: DrillConfig;
  onDrillComplete?: (result: {
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  }) => void;
}

export const PracticeDrill = ({
  questionIds,
  drillData,
  drillConfig,
  onDrillComplete,
}: SimplePracticeDrillDemoProps) => {
  console.log('=== SimplePracticeDrillDemo Props ===');
  console.log('questionIds:', questionIds);
  console.log('drillData:', drillData);
  console.log('drillConfig:', drillConfig);

  const handleSubmit = (
    answers: Record<number, string>,
    results: {
      correctAnswers: number;
      totalQuestions: number;
    }
  ) => {
    console.log('=== Parent Component Received Answers ===');
    console.log('Answers:', answers);
    console.log('Results:', results);
    console.log('Drill Data:', drillData);

    // Check if passed based on minScore
    const minScore = drillConfig?.minScore || 0;
    const passed = results.correctAnswers >= minScore;

    console.log(
      `Score: ${results.correctAnswers}/${results.totalQuestions}, MinScore: ${minScore}, Passed: ${passed}`
    );

    // Call parent callback
    if (onDrillComplete) {
      onDrillComplete({
        correctAnswers: results.correctAnswers,
        totalQuestions: results.totalQuestions,
        passed,
      });
    }
  };

  return (
    <PracticeDrillViewer questionIds={questionIds} onSubmit={handleSubmit} />
  );
};
