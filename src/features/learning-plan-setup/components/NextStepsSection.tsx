import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Target, ChevronRight } from 'lucide-react';
import { TestCompletionDialog } from './TestCompletionDialog';

interface NextStepsSectionProps {
  hasCompletedTest: boolean;
  onTakeTest: () => void;
  onSkipTest: (confirmed: boolean) => void;
  onCloseDialog?: () => void;
}

export function NextStepsSection({
  hasCompletedTest,
  onTakeTest,
  onSkipTest,
  onCloseDialog,
}: NextStepsSectionProps) {
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testConfirmCount, setTestConfirmCount] = useState(1);

  // If user has completed test, don't show dialog
  if (hasCompletedTest) {
    return null;
  }

  const handleSkipClick = () => {
    setTestDialogOpen(true);
  };

  const handleSkip = () => {
    if (testConfirmCount < 2) {
      setTestConfirmCount(testConfirmCount + 1);
    } else {
      handleCloseDialog();
      onSkipTest(true);
    }
  };

  const handleTakeTest = () => {
    handleCloseDialog();
    onTakeTest();
  };

  const handleCloseDialog = () => {
    setTestDialogOpen(false);
    setTestConfirmCount(1);
    onCloseDialog?.();
  };

  return (
    <>
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Next Steps
        </h3>
        <p className="text-sm text-purple-800 mb-4">
          To create an optimal learning path, we recommend taking a placement
          test to accurately assess your current level.
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleTakeTest}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            Take Placement Test
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            type="button"
            onClick={handleSkipClick}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Skip, Start Now
          </Button>
        </div>
      </div>

      <TestCompletionDialog
        isOpen={testDialogOpen}
        confirmCount={testConfirmCount}
        onSkip={handleSkip}
        onTakeTest={handleTakeTest}
        onClose={handleCloseDialog}
      />
    </>
  );
}
