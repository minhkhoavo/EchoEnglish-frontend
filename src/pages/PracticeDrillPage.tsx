import { useLocation } from 'react-router-dom';
import { PracticeDrill } from '../features/practice-drill/components/PracticeDrill';

const PracticeDrillPage = () => {
  const location = useLocation();
  const { questionIds, drillData } = location.state || {};

  const drillConfig = drillData
    ? {
        minScore: drillData.minCorrectAnswers,
        isRetryable: drillData.attempts ? drillData.attempts < 3 : true,
        maxAttempts: 3,
      }
    : undefined;

  return (
    <PracticeDrill
      questionIds={questionIds}
      drillData={drillData}
      drillConfig={drillConfig}
    />
  );
};

export default PracticeDrillPage;
