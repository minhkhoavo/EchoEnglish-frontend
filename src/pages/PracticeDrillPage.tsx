import { useLocation } from 'react-router-dom';
import { PracticeDrill } from '../features/practice-drill/components/PracticeDrill';
import { useCompletePracticeDrillMutation } from '../features/user-dashboard/services/dashboardApi';
import { toast } from '@/hooks/use-toast';

const PracticeDrillPage = () => {
  const location = useLocation();
  const { questionIds, drillData, sessionId } = location.state || {};
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

        toast({
          title: '🎉 Congratulations!',
          description: `You passed the drill with ${result.correctAnswers}/${result.totalQuestions} correct answers!`,
        });
      } catch (error) {
        console.error('Failed to complete practice drill:', error);
        toast({
          title: 'Completion tracking failed',
          description: 'Your progress may not be saved.',
          variant: 'destructive',
        });
      }
    } else if (!result.passed && drillConfig) {
      toast({
        title: 'Keep practicing!',
        description: `You need ${drillConfig.minScore} correct answers to pass. You got ${result.correctAnswers}/${result.totalQuestions}. Try again!`,
        variant: 'destructive',
      });
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
