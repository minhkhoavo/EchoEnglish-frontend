import { type ReactNode } from 'react';
import { Coins } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { BlurredContent } from './BlurredContent';

interface UnlockAnalysisDialogProps {
  children: ReactNode;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  analysisCost?: number;
}

export function UnlockAnalysisDialog({
  children,
  title,
  description,
  isLoading = false,
  onConfirm,
  analysisCost = 5,
}: UnlockAnalysisDialogProps) {
  return (
    <ConfirmationDialog
      title="Unlock Deep Analysis"
      description={`This will use ${analysisCost} credits to generate a comprehensive analysis of your exam performance, including detailed insights, skill breakdown, and personalized recommendations.`}
      confirmText={`Use ${analysisCost} Credits`}
      cancelText="Not Now"
      icon={
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#1e40af]">
          <Coins className="h-6 w-6 text-white" />
        </div>
      }
      onConfirm={onConfirm}
    >
      <div>
        <BlurredContent
          onUnlock={() => {}}
          title={title}
          description={description}
          isLoading={isLoading}
        >
          {children}
        </BlurredContent>
      </div>
    </ConfirmationDialog>
  );
}
