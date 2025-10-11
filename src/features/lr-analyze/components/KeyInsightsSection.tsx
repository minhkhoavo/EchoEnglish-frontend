import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface KeyInsightsSectionProps {
  insights: string[];
  summary?: string;
}

export function KeyInsightsSection({
  insights,
  summary,
}: KeyInsightsSectionProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {summary && (
        <Card className="p-3 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#22c55e] rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-[#0f172a] mb-2">
                Overall Summary
              </h2>
              <p className="text-sm text-[#1e293b] leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Key Insights */}
      <Card className="p-3 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border border-[#fcd34d]">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-[#f59e0b] rounded-lg">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-[#0f172a] mb-1">
              Key Insights & Recommendations
            </h2>
            <p className="text-xs text-[#78350f]">
              Strategic observations to guide your learning journey
            </p>
          </div>
          <Badge className="bg-[#f59e0b] text-white border-0">
            {insights.length} Insights
          </Badge>
        </div>

        <div className="space-y-2">
          {insights.map((insight, index) => (
            <Card
              key={index}
              className="p-3 bg-white/80 border border-[#fcd34d]/30 hover:border-[#f59e0b]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1e293b] leading-relaxed">
                    {insight}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
