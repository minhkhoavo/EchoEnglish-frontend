import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, FileText, AlertTriangle } from 'lucide-react';
import type { AIInsight } from '../types/dashboard.types';

interface AIInsightsProps {
  insights: AIInsight[];
  onActionClick?: (insight: AIInsight) => void;
}

const insightIcons = {
  critical: AlertTriangle,
  grammar: BookOpen,
  vocabulary: FileText,
  listening: Lightbulb,
  reading: FileText,
};

const insightColors = {
  critical: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
  grammar: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' },
  vocabulary: { bg: '#F3E8FF', text: '#6B21A8', border: '#8B5CF6' },
  listening: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
  reading: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
};

const getInsightTypeFromContent = (title: string, description: string) => {
  const content = (title + ' ' + description).toLowerCase();
  if (content.includes('grammar')) return 'grammar';
  if (content.includes('vocabulary')) return 'vocabulary';
  if (content.includes('listening')) return 'listening';
  if (content.includes('reading')) return 'reading';
  if (content.includes('critical') || content.includes('weakness'))
    return 'critical';
  return 'critical';
};

export const AIInsights = ({ insights, onActionClick }: AIInsightsProps) => {
  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const insightType = getInsightTypeFromContent(
          insight.title,
          insight.description
        );
        const Icon = insightIcons[insightType];
        const colors = insightColors[insightType];

        return (
          <Card
            key={insight._id}
            className="border-l-4 hover:shadow-lg transition-shadow"
            style={{
              borderLeftColor: colors.border,
              backgroundColor: colors.bg,
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <Icon className="h-6 w-6" style={{ color: colors.border }} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4
                    className="font-semibold text-lg mb-2"
                    style={{ color: colors.text }}
                  >
                    {insight.title}
                  </h4>
                  <p className="text-sm mb-4" style={{ color: '#374151' }}>
                    {insight.description}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => onActionClick?.(insight)}
                    style={{
                      backgroundColor: colors.border,
                      color: '#FFFFFF',
                    }}
                    className="hover:opacity-90"
                  >
                    {insight.actionText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
