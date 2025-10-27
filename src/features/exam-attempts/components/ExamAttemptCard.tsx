import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Calendar,
  PlayCircle,
  Eye,
  Headphones,
  Mic,
  FileText,
} from 'lucide-react';
import { ExamStatusBadge, ScoreDisplay } from './ExamCardComponents';
import type { ExamAttempt } from '../types';

interface ExamAttemptCardProps {
  attempt: ExamAttempt;
  onViewDetails?: (id: string) => void;
  onContinue?: (id: string) => void;
}

const typeConfig = {
  'listening-reading': {
    icon: Headphones,
    label: 'Listening & Reading',
    gradient: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    borderColor: 'border-purple-200',
  },
  speaking: {
    icon: Mic,
    label: 'Speaking',
    gradient: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
  },
  writing: {
    icon: FileText,
    label: 'Writing',
    gradient: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    borderColor: 'border-teal-200',
  },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (seconds?: number) => {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const ExamAttemptCard: React.FC<ExamAttemptCardProps> = ({
  attempt,
  onViewDetails,
  onContinue,
}) => {
  const config = typeConfig[attempt.type];
  const Icon = config.icon;

  const renderSectionScores = () => {
    if (attempt.type !== 'listening-reading') return null;

    return (
      <div className="grid grid-cols-2 gap-2">
        {attempt.listeningScore != null && (
          <div className="bg-white/70 backdrop-blur-sm p-2 rounded-md border border-slate-200/50">
            <div className="flex items-center gap-1 mb-1">
              <Headphones className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-slate-700">
                Listening
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {attempt.listeningScore}
            </div>
          </div>
        )}
        {attempt.readingScore != null && (
          <div className="bg-white/70 backdrop-blur-sm p-2 rounded-md border border-slate-200/50">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-indigo-600" />
              <span className="text-xs font-medium text-slate-700">
                Reading
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              {attempt.readingScore}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressInfo = () => {
    if (attempt.status === 'completed' || !attempt.startedAt) return null;

    const startTime = new Date(attempt.startedAt);
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-700 font-medium">Time Elapsed</span>
          <span className="text-blue-800 font-semibold">
            {elapsedMinutes}m {elapsedSeconds}s
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden flex flex-col ${
        attempt.type === 'listening-reading' ? 'min-h-[320px]' : 'min-h-[220px]'
      }`}
    >
      {/* Compact Header with gradient background */}
      <CardHeader
        className={`${config.bgColor} ${config.borderColor} border-b relative overflow-hidden p-4`}
      >
        <div className="absolute inset-0 bg-gradient-to-r opacity-20" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div
                className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} shadow-md`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">
                  {attempt.title}
                </h3>
                {attempt.description && (
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {attempt.description}
                  </p>
                )}
              </div>
            </div>
            <ExamStatusBadge
              status={attempt.status}
              className="text-xs px-2 py-1"
            />
          </div>

          {/* Compact Metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(attempt.startedAt)}</span>
            </div>
            <span>{formatDuration(attempt.duration)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3 bg-white flex-1">
        {/* Score display */}
        {attempt.status === 'completed' &&
          attempt.score != null &&
          attempt.maxScore != null && (
            <ScoreDisplay
              score={attempt.score}
              maxScore={attempt.maxScore}
              percentage={attempt.percentage}
              label="Score"
            />
          )}

        {/* Compact Section scores for L&R */}
        {renderSectionScores()}

        {/* Progress info for in-progress attempts */}
        {renderProgressInfo()}
      </CardContent>

      <CardFooter className="p-3 bg-slate-50/50 border-t border-slate-100">
        <div className="flex gap-2 w-full">
          {/* Only Speaking tests have in-progress status with Continue button */}
          {attempt.status === 'in-progress' &&
            attempt.type === 'speaking' &&
            onContinue && (
              <Button
                onClick={() => onContinue(attempt.toeicSpeakingTestId)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md h-8 text-xs"
                size="sm"
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                Continue
              </Button>
            )}
          {/* Show View Details for completed tests or non-Speaking in-progress */}
          {(attempt.status === 'completed' || attempt.type !== 'speaking') &&
            onViewDetails && (
              <Button
                onClick={() => onViewDetails(attempt.id)}
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50 hover:border-slate-300 h-8 text-xs"
                size="sm"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
};
