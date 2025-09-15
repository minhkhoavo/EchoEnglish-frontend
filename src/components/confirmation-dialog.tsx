import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  onConfirm,
  onCancel,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon || (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left mt-2">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook for programmatic usage
export const useConfirmationDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
  } | null>(null);

  const confirm = (options: {
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
  }) => {
    setConfig({
      title: options.title || 'Are you sure?',
      description: options.description || 'This action cannot be undone.',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      variant: options.variant,
    });
    setIsOpen(true);
  };

  const handleConfirm = () => {
    config?.onConfirm();
    setIsOpen(false);
    setConfig(null);
  };

  const handleCancel = () => {
    config?.onCancel?.();
    setIsOpen(false);
    setConfig(null);
  };

  const ConfirmDialog = config ? (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">{config.title}</DialogTitle>
              <DialogDescription className="text-left mt-2">
                {config.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={
              config.variant === 'destructive' ? 'destructive' : 'default'
            }
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return { confirm, ConfirmDialog };
};
