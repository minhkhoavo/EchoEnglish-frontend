import React, { type ReactNode, useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type {
  CheckAffordFeatureResponse,
  FeaturePricingType,
} from '@/features/auth/services/creditsApi';
import { useLazyCheckCanAffordFeatureQuery } from '@/features/auth/services/creditsApi';
import { useToast } from '@/hooks/use-toast';

interface AffordabilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void | Promise<void>;
  onBuyCredits: () => void;
  featureType: FeaturePricingType;
  isPending?: boolean;
  /** Custom title for the dialog */
  title?: string;
  /** Custom description to entice users */
  description?: string;
  /** Optional children to show blurred preview */
  children?: ReactNode;
}

export const AffordabilityDialog: React.FC<AffordabilityDialogProps> = ({
  isOpen,
  onClose,
  onProceed,
  onBuyCredits,
  featureType,
  isPending = false,
  title,
  description,
  children,
}) => {
  const { toast } = useToast();
  const [affordabilityData, setAffordabilityData] =
    useState<CheckAffordFeatureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkCanAfford] = useLazyCheckCanAffordFeatureQuery();

  // Check affordability when dialog opens
  useEffect(() => {
    if (!isOpen) {
      setAffordabilityData(null);
      return;
    }

    const checkAffordability = async () => {
      setIsLoading(true);
      try {
        const result = await checkCanAfford(featureType).unwrap();
        setAffordabilityData(result);
      } catch (error) {
        console.error(
          '[AffordabilityDialog] Failed to check affordability:',
          error
        );
        toast({
          title: 'Error',
          description: 'Failed to check your credits. Please try again.',
          variant: 'destructive',
        });
        // Delay close to let user see the error
        setTimeout(() => {
          onClose();
        }, 1500);
      } finally {
        setIsLoading(false);
      }
    };

    checkAffordability();
    // Only depend on isOpen and featureType - don't include callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, featureType]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <Card className="relative p-6 max-w-md w-full mx-4 shadow-2xl border-0">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#2563eb] border-r-transparent"></div>
            </div>
            <p className="text-[#64748b] font-medium">
              Checking your credits...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!affordabilityData) return null;

  const { canAfford, requiredCredits, currentCredits } = affordabilityData;

  // Show blurred preview if children provided
  const showPreview = Boolean(children);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Content */}
      <Card
        className={`relative ${showPreview ? 'max-w-4xl' : 'max-w-md'} w-full mx-4 shadow-2xl border-0 bg-white transition-all`}
      >
        <div className={showPreview ? 'flex flex-col lg:flex-row' : ''}>
          {/* Preview Section (if children provided) */}
          {showPreview && (
            <div className="lg:flex-1 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="relative">
                {/* Blurred content */}
                <div className="blur-sm pointer-events-none select-none opacity-30">
                  {children}
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/60 via-white/80 to-white/60">
                  <div className="bg-white/95 rounded-lg p-4 shadow-lg border border-gray-200">
                    <Lock className="w-8 h-8 text-[#2563eb] mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`p-6 ${showPreview ? 'lg:w-96' : ''}`}>
            {canAfford ? (
              <>
                {/* Sufficient Credits */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2">
                    {title || 'Ready to Unlock?'}
                  </h2>
                  <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
                    {description ||
                      'You have enough credits to unlock this feature.'}
                  </p>

                  {/* Credits info */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#64748b]">Credits needed:</span>
                      <span className="font-semibold text-blue-600">
                        {requiredCredits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#64748b]">Your balance:</span>
                      <span className="font-semibold text-green-600">
                        {currentCredits}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onProceed}
                      disabled={isPending}
                      className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Proceed
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Insufficient Credits */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2">
                    Insufficient Credits
                  </h2>
                  <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
                    {description ||
                      "You don't have enough credits to unlock this feature. Please purchase more credits to continue."}
                  </p>

                  {/* Credits info */}
                  <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-[#64748b] font-medium">
                        Credits needed:
                      </span>
                      <span className="font-semibold text-red-600">
                        {requiredCredits}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-[#64748b] font-medium">
                        Your balance:
                      </span>
                      <span className="font-semibold text-red-600">
                        {currentCredits}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-red-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#64748b] font-medium">
                          Needed:
                        </span>
                        <span className="font-bold text-red-600 text-base">
                          {requiredCredits - currentCredits}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isPending}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={onBuyCredits}
                      disabled={isPending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Buy Credits
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
