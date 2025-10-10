import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import type { DomainPerformance } from '../types/analysis';

interface DomainPerformanceSectionProps {
  domainPerformance: DomainPerformance[];
  compact?: boolean; // For embedding in overview
}

export function DomainPerformanceSection({
  domainPerformance,
  compact = false,
}: DomainPerformanceSectionProps) {
  if (!domainPerformance || domainPerformance.length === 0) {
    return null;
  }

  // Sort by accuracy (ascending) to show weakest first, then take top weak ones
  const sortedDomains = [...domainPerformance].sort(
    (a, b) => a.accuracy - b.accuracy
  );

  // Show only top 10 weakest and top 5 strongest in compact mode
  const weakDomains = sortedDomains
    .filter((d) => d.isWeak)
    .slice(0, compact ? 8 : 15);
  const strongDomains = sortedDomains
    .filter((d) => !d.isWeak)
    .slice(0, compact ? 5 : 10);

  const formatDomainName = (domain: string) => {
    return domain
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 60) return 'text-[#22c55e]';
    if (accuracy >= 40) return 'text-[#f59e0b]';
    return 'text-[#dc2626]';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 60) return 'bg-[#22c55e]';
    if (accuracy >= 40) return 'bg-[#f59e0b]';
    return 'bg-[#dc2626]';
  };

  if (compact) {
    // Compact view for Overview tab
    return (
      <div className="space-y-3">
        {/* Weak Domains - Horizontal bars */}
        {weakDomains.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-bold text-[#0f172a]">
                Areas Needing Improvement
              </h4>
              <Badge variant="outline" className="text-xs">
                {weakDomains.length} domains
              </Badge>
            </div>
            <div className="space-y-2">
              {weakDomains.map((domain) => (
                <div
                  key={domain.domain}
                  className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#e5e7eb]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#0f172a] truncate">
                        {formatDomainName(domain.domain)}
                      </span>
                      <span
                        className={`text-xs font-bold ${getAccuracyColor(domain.accuracy)}`}
                      >
                        {domain.accuracy.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(domain.accuracy)} transition-all duration-300`}
                        style={{ width: `${domain.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strong Domains - Simple list */}
        {strongDomains.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-bold text-[#0f172a]">Strong Areas</h4>
              <Badge
                variant="outline"
                className="text-xs bg-[#f0fdf4] border-[#22c55e]"
              >
                {strongDomains.length} domains
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {strongDomains.map((domain) => (
                <Badge
                  key={domain.domain}
                  className="bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0] text-xs"
                >
                  {formatDomainName(domain.domain)} {domain.accuracy.toFixed(0)}
                  %
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view (if needed in future)
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-[#3b82f6] rounded-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#0f172a]">
            Domain Performance
          </h2>
          <p className="text-xs text-[#64748b]">
            Performance across business contexts
          </p>
        </div>
      </div>

      {/* Same compact layout for full view */}
      <div className="space-y-4">
        {weakDomains.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-2">
              Areas Needing Improvement
            </h4>
            <div className="space-y-2">
              {weakDomains.map((domain) => (
                <div
                  key={domain.domain}
                  className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#0f172a]">
                        {formatDomainName(domain.domain)}
                      </span>
                      <span className="text-xs text-[#64748b]">
                        {domain.correctAnswers}/{domain.totalQuestions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={domain.accuracy}
                        className="flex-1 h-2"
                      />
                      <span
                        className={`text-sm font-bold ${getAccuracyColor(domain.accuracy)}`}
                      >
                        {domain.accuracy.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {strongDomains.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-[#0f172a] mb-2">
              Strong Performance
            </h4>
            <div className="flex flex-wrap gap-2">
              {strongDomains.map((domain) => (
                <Badge
                  key={domain.domain}
                  className="bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]"
                >
                  {formatDomainName(domain.domain)} {domain.accuracy.toFixed(0)}
                  %
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
