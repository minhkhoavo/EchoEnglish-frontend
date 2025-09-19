import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, FileText, RefreshCw } from 'lucide-react';
import { formatMs } from '@/features/tests/utils/formatMs';

interface ContinueTestDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onCancel: () => void;
  testTitle: string;
  progress: number;
  timeRemaining: number; // ms còn lại
  numberOfAnsweredQuestions: number;
  totalQuestions: number;
}

export const ContinueTestDialog: React.FC<ContinueTestDialogProps> = ({
  isOpen,
  onContinue,
  onRestart,
  onCancel,
  testTitle,
  progress,
  timeRemaining,
  numberOfAnsweredQuestions: answeredQuestions,
  totalQuestions,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Ongoing Test Session
          </DialogTitle>
          <DialogDescription>
            You have an unfinished test. Would you like to continue or restart?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Test: {testTitle}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Time: {formatMs(timeRemaining)}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>
                  Questions: {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Restart
          </Button>
          <Button onClick={onContinue} className="gap-2">
            <Clock className="h-4 w-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
