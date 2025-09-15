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

interface ContinueTestDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onRestart: () => void;
  onCancel: () => void;
  testTitle: string;
  progress: number;
  timeElapsed: string;
  answeredQuestions: number;
  totalQuestions: number;
}

export const ContinueTestDialog: React.FC<ContinueTestDialogProps> = ({
  isOpen,
  onContinue,
  onRestart,
  onCancel,
  testTitle,
  progress,
  timeElapsed,
  answeredQuestions,
  totalQuestions,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bài test đang thực hiện
          </DialogTitle>
          <DialogDescription>
            Bạn có một bài test đang làm dở. Bạn muốn tiếp tục hay bắt đầu lại?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Đề thi: {testTitle}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Thời gian: {timeElapsed}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-500" />
                <span>
                  Câu hỏi: {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiến độ hoàn thành</span>
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
            Hủy
          </Button>
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm lại từ đầu
          </Button>
          <Button onClick={onContinue} className="gap-2">
            <Clock className="h-4 w-4" />
            Tiếp tục làm bài
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
