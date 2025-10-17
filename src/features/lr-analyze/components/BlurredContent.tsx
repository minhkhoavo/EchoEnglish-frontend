import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

interface BlurredContentProps {
  children: ReactNode;
  onUnlock: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function BlurredContent({
  children,
  onUnlock,
  title,
  description,
  isLoading = false,
}: BlurredContentProps) {
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/80 via-white/90 to-white/80 backdrop-blur-[2px]">
        <Card className="p-6 max-w-md mx-4 shadow-xl border-2 border-[#2563eb]/20 bg-white/95">
          <div className="text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#0f172a] mb-2">{title}</h3>

            {/* Description */}
            <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
              {description}
            </p>

            {/* Unlock Button */}
            <Button
              onClick={onUnlock}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2563eb] to-[#1e40af] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Unlock Deep Analysis
                </>
              )}
            </Button>

            {/* Feature hints */}
            <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
              <p className="text-xs text-[#64748b] mb-2">
                Unlock to get access to:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-xs px-2 py-1 bg-[#dbeafe] text-[#2563eb] rounded-full">
                  📊 Skill Breakdown
                </span>
                <span className="text-xs px-2 py-1 bg-[#dbeafe] text-[#2563eb] rounded-full">
                  🎯 Personalized Plan
                </span>
                <span className="text-xs px-2 py-1 bg-[#dbeafe] text-[#2563eb] rounded-full">
                  💡 Expert Insights
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
