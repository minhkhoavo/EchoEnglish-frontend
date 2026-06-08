import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

interface TestCompletionDialogProps {
  isOpen: boolean;
  confirmCount: number;
  onSkip: () => void;
  onTakeTest: () => void;
  onClose?: () => void;
}

export function TestCompletionDialog({
  isOpen,
  confirmCount,
  onSkip,
  onTakeTest,
  onClose,
}: TestCompletionDialogProps) {
  const isSecondConfirm = confirmCount === 2;

  const handleOpenChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            {isSecondConfirm
              ? 'Last chance to take the placement test'
              : 'No placement test completed'}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="space-y-4">
          {isSecondConfirm ? (
            <>
              <p className="text-base font-semibold text-red-700">
                ⚠️ Final Warning: Skipping the placement test
              </p>
              <p>
                We <strong>strongly recommend</strong> taking a placement test
                before creating your learning plan. Without it, we cannot
                accurately assess your current level and tailor your roadmap.
              </p>
              <Alert className="border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-semibold">
                  Important: Your learning path cannot be regenerated or
                  adjusted later if it doesn't match your actual level. You'll
                  need to retake the test if changes are needed.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                This is your last chance to take the test now. After this,
                you'll proceed to plan creation.
              </p>
            </>
          ) : (
            <>
              <p>
                We noticed you haven't taken a placement test yet. Taking one
                will help us understand your current level better.
              </p>
              <Alert className="border-blue-300 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  A placement test typically takes 30-45 minutes and gives us
                  valuable insights about your English level.
                </AlertDescription>
              </Alert>
            </>
          )}
        </DialogDescription>

        <DialogFooter className="flex gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            className={isSecondConfirm ? 'border-gray-300' : ''}
          >
            {isSecondConfirm ? 'Skip Anyway' : 'Skip for Now'}
          </Button>
          <Button
            type="button"
            onClick={onTakeTest}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          >
            Take Placement Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
