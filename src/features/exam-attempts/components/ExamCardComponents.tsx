import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import type { ExamStatus } from '../types';

interface ExamStatusBadgeProps {
  status: ExamStatus;
  className?: string;
}

const statusConfig = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  'in-progress': {
    label: 'In Progress',
    icon: PlayCircle,
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  'not-started': {
    label: 'Not Started',
    icon: AlertCircle,
    className: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
  },
};

export const ExamStatusBadge: React.FC<ExamStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={`${config.className} ${className} flex items-center gap-1 px-2 py-1 font-medium text-xs`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

interface ScoreDisplayProps {
  score?: number;
  maxScore?: number;
  percentage?: number;
  label?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore,
  percentage,
  label = 'Score',
}) => {
  const calculatedPercentage =
    percentage ||
    (score && maxScore ? Math.round((score / maxScore) * 100) : 0);

  const getScoreColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-600';
    if (pct >= 70) return 'text-blue-600';
    if (pct >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBackground = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-50 border-emerald-100';
    if (pct >= 70) return 'bg-blue-50 border-blue-100';
    if (pct >= 60) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  if (score == null || maxScore == null) return null;

  return (
    <div
      className={`p-2 rounded-lg border ${getScoreBackground(calculatedPercentage)}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <div className="text-right">
          <div
            className={`text-sm font-bold ${getScoreColor(calculatedPercentage)}`}
          >
            {score}
            <span className="text-xs font-medium text-slate-500">
              /{maxScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
