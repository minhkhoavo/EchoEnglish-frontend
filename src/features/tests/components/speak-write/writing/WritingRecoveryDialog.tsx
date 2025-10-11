import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface WritingRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: () => void;
  onStartFresh: () => void;
}

export const WritingRecoveryDialog: React.FC<WritingRecoveryDialogProps> = ({
  open,
  onOpenChange,
  onRestore,
  onStartFresh,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Recover Previous Session
          </DialogTitle>
          <DialogDescription>
            We found a previous exam session. Would you like to continue where
            you left off?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onStartFresh}>
            Start Fresh
          </Button>
          <Button onClick={onRestore}>Continue Previous Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
