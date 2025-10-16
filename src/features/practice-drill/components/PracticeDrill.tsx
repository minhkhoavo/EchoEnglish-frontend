import { PracticeDrillViewer } from './PracticeDrillViewer';
import type { WeaknessDrill } from '../../lr-analyze/types/analysis';

interface DrillConfig {
  minScore?: number;
  isRetryable?: boolean;
  maxAttempts?: number;
}

interface SimplePracticeDrillDemoProps {
  questionIds?: string[];
  drillData?: WeaknessDrill;
  drillConfig?: DrillConfig;
}

export const PracticeDrill = ({
  questionIds,
  drillData,
  drillConfig,
}: SimplePracticeDrillDemoProps) => {
  console.log('=== SimplePracticeDrillDemo Props ===');
  console.log('questionIds:', questionIds);
  console.log('drillData:', drillData);
  console.log('drillConfig:', drillConfig);

  const handleSubmit = (answers: Record<number, string>) => {
    console.log('=== Parent Component Received Answers ===');
    console.log('Answers:', answers);
    console.log('Drill Data:', drillData);
  };

  return (
    <PracticeDrillViewer questionIds={questionIds} onSubmit={handleSubmit} />
  );
};
