import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingDown,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import type { DiagnosisInsight, SeverityLevel } from '../types/analysis';

interface DiagnosisSectionProps {
  weaknesses: DiagnosisInsight[];
}

export function DiagnosisSection({ weaknesses }: DiagnosisSectionProps) {
  const getSeverityConfig = (severity: SeverityLevel) => {
    const configs = {
      CRITICAL: {
        bgColor: 'bg-[#fef2f2]',
        borderColor: 'border-[#fecaca]',
        textColor: 'text-[#dc2626]',
        badgeBg: 'bg-[#dc2626]',
        icon: AlertCircle,
        label: 'Critical',
      },
      HIGH: {
        bgColor: 'bg-[#fef3c7]',
        borderColor: 'border-[#fde68a]',
        textColor: 'text-[#d97706]',
        badgeBg: 'bg-[#f59e0b]',
        icon: AlertTriangle,
        label: 'High Priority',
      },
      MEDIUM: {
        bgColor: 'bg-[#dbeafe]',
        borderColor: 'border-[#bfdbfe]',
        textColor: 'text-[#1d4ed8]',
        badgeBg: 'bg-[#3b82f6]',
        icon: Info,
        label: 'Medium',
      },
      LOW: {
        bgColor: 'bg-[#f0fdf4]',
        borderColor: 'border-[#bbf7d0]',
        textColor: 'text-[#15803d]',
        badgeBg: 'bg-[#22c55e]',
        icon: Info,
        label: 'Low Priority',
      },
    };
    return configs[severity];
  };

  const getImpactLabel = (score: number): string => {
    if (score >= 80) return 'Very High Impact';
    if (score >= 60) return 'High Impact';
    if (score >= 40) return 'Moderate Impact';
    return 'Low Impact';
  };

  const criticalWeaknesses = weaknesses.filter(
    (w) => w.severity === 'CRITICAL'
  );
  const highWeaknesses = weaknesses.filter((w) => w.severity === 'HIGH');
  const otherWeaknesses = weaknesses.filter(
    (w) => !['CRITICAL', 'HIGH'].includes(w.severity)
  );

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <Card className="p-5 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-[#2563eb] rounded-lg">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#0f172a] mb-1.5">
              AI-Powered Weakness Diagnosis
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed mb-3">
              Our advanced analytics engine has identified specific patterns in
              your test performance. Each weakness below represents a concrete
              opportunity for improvement.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 rounded-lg">
                <div className="w-2 h-2 bg-[#dc2626] rounded-full"></div>
                <span className="text-xs font-medium text-[#0f172a]">
                  {criticalWeaknesses.length} Critical
                </span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 rounded-lg">
                <div className="w-2 h-2 bg-[#f59e0b] rounded-full"></div>
                <span className="text-xs font-medium text-[#0f172a]">
                  {highWeaknesses.length} High Priority
                </span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-white/80 rounded-lg">
                <div className="w-2 h-2 bg-[#3b82f6] rounded-full"></div>
                <span className="text-xs font-medium text-[#0f172a]">
                  {otherWeaknesses.length} Other
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Critical Weaknesses - More Compact */}
      {criticalWeaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 bg-[#fef2f2] rounded-lg">
              <AlertCircle className="w-4 h-4 text-[#dc2626]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                Critical Weaknesses
              </h3>
              <p className="text-xs text-[#64748b]">
                Immediate attention required
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {criticalWeaknesses.map((weakness) => {
              const config = getSeverityConfig(weakness.severity);
              const Icon = config.icon;

              return (
                <Card
                  key={weakness.id}
                  className={`p-3 ${config.bgColor} border ${config.borderColor}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 ${config.badgeBg} rounded-lg flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[#0f172a]">
                              {weakness.title}
                            </h4>
                            <Badge
                              className={`${config.badgeBg} text-white border-0 text-xs px-1.5 py-0`}
                            >
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Badge variant="outline" className="text-xs">
                              {weakness.category}
                            </Badge>
                            {weakness.skillName && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50"
                              >
                                {weakness.skillName}
                              </Badge>
                            )}
                            <span className="text-xs text-[#64748b]">
                              Parts: {weakness.affectedParts.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#1e293b] leading-relaxed mb-2">
                        {weakness.description}
                      </p>

                      {/* Compact Performance Display */}
                      <div className="p-2 bg-white/70 rounded mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[#64748b]">
                            Your Accuracy
                          </span>
                          <p className="text-base font-bold text-[#dc2626]">
                            {weakness.userAccuracy}%
                          </p>
                        </div>
                        {weakness.incorrectCount !== undefined &&
                          weakness.totalCount !== undefined && (
                            <p className="text-xs text-[#64748b] mt-1">
                              {weakness.incorrectCount}/{weakness.totalCount}{' '}
                              incorrect
                            </p>
                          )}
                      </div>

                      {/* Compact Impact Score */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#64748b]">
                            Impact Score
                          </span>
                          <span
                            className={`text-xs font-bold ${config.textColor}`}
                          >
                            {getImpactLabel(weakness.impactScore)}
                          </span>
                        </div>
                        <div className="h-1 bg-white/70 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${config.badgeBg} transition-all duration-500`}
                            style={{ width: `${weakness.impactScore}%` }}
                          />
                        </div>
                      </div>

                      <Button
                        className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs h-8"
                        onClick={() => {
                          // Navigate to specific study plan or drill
                        }}
                      >
                        View Plan
                        <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* High Priority Weaknesses - More Compact */}
      {highWeaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1.5 bg-[#fef3c7] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">
                High Priority Areas
              </h3>
              <p className="text-xs text-[#64748b]">
                Address after critical items
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {highWeaknesses.map((weakness) => {
              const config = getSeverityConfig(weakness.severity);
              const Icon = config.icon;

              return (
                <Card
                  key={weakness.id}
                  className={`p-3 ${config.bgColor} border ${config.borderColor}`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`p-1.5 ${config.badgeBg} rounded-lg flex-shrink-0`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h4 className="text-sm font-bold text-[#0f172a] flex-1 truncate">
                          {weakness.title}
                        </h4>
                        <Badge
                          className={`${config.badgeBg} text-white border-0 text-xs px-1.5 py-0 flex-shrink-0`}
                        >
                          High
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Badge variant="outline" className="text-xs">
                          {weakness.category}
                        </Badge>
                        <span className="text-xs text-[#64748b] truncate">
                          Parts: {weakness.affectedParts.join(', ')}
                        </span>
                      </div>

                      <p className="text-xs text-[#1e293b] leading-snug mb-2 line-clamp-2">
                        {weakness.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-[#64748b]">
                              {weakness.userAccuracy}%
                            </span>
                          </div>
                          <Progress
                            value={weakness.userAccuracy}
                            className="h-1"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs h-7 px-2"
                          onClick={() => {
                            // Navigate to drill
                          }}
                        >
                          Fix
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Weaknesses */}
      {otherWeaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 bg-[#dbeafe] rounded-lg">
              <Info className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a]">
                Additional Opportunities
              </h3>
              <p className="text-xs text-[#64748b]">
                Lower priority areas for continued improvement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {otherWeaknesses.map((weakness) => {
              const config = getSeverityConfig(weakness.severity);
              const Icon = config.icon;

              return (
                <Card
                  key={weakness.id}
                  className="p-3 border border-[#e5e7eb] hover:border-[#bfdbfe] transition-colors"
                >
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div
                      className={`p-1.5 ${config.bgColor} rounded-lg flex-shrink-0`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-bold text-[#0f172a] mb-1">
                        {weakness.title}
                      </h5>
                      <Badge variant="outline" className="text-xs mb-1.5">
                        {weakness.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-[#475569] mb-2.5 line-clamp-2">
                    {weakness.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#64748b]">
                      Accuracy: {weakness.userAccuracy}%
                    </span>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
