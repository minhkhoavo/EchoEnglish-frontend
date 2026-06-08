import { useLocation, useSearchParams } from 'react-router-dom';
import { PracticeDrill } from '../features/practice-drill/components/PracticeDrill';
import { useCompletePracticeDrillMutation } from '../features/user-dashboard/services/dashboardApi';
import { toast } from 'sonner';

const PracticeDrillPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    questionIds: stateQuestionIds,
    drillData,
    sessionId,
  } = location.state || {};

  // Get questionIds from URL params if not available in state
  const urlQuestionIds =
    searchParams.get('questionIds')?.split(',').filter(Boolean) || [];
  const questionIds = stateQuestionIds || urlQuestionIds;
  const [completePracticeDrill] = useCompletePracticeDrillMutation();

  const drillConfig = drillData
    ? {
        minScore: drillData.minCorrectAnswers,
        isRetryable: drillData.attempts ? drillData.attempts < 3 : true,
        maxAttempts: 3,
        sessionId: sessionId,
      }
    : undefined;

  const handleDrillComplete = async (result: {
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
  }) => {
    console.log('Drill completed:', result);
    if (result.passed && sessionId) {
      try {
        await completePracticeDrill({
          sessionId,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          score: (result.correctAnswers / result.totalQuestions) * 100,
        }).unwrap();

        toast.success(
          `🎉 Congratulations! You passed the drill with ${result.correctAnswers}/${result.totalQuestions} correct answers!`
        );
      } catch (error) {
        console.error('Failed to complete practice drill:', error);
        toast.error(
          'Completion tracking failed: Your progress may not be saved.'
        );
      }
    } else if (!result.passed && drillConfig) {
      toast.error(
        `Keep practicing! You need ${drillConfig.minScore} correct answers to pass. You got ${result.correctAnswers}/${result.totalQuestions}. Try again!`
      );
    }
  };

  return (
    <PracticeDrill
      questionIds={questionIds}
      drillData={drillData}
      drillConfig={drillConfig}
      onDrillComplete={handleDrillComplete}
    />
  );
};

export default PracticeDrillPage;
