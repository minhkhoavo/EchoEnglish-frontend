import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { PlayCircle, Clock, Mic, Calendar, TrendingUp } from 'lucide-react';
import type { Recording } from '../types/recordings.types';

interface RecordingCardProps {
  recording: Recording;
  onAnalyze: (recordingId: string) => void;
}

export function RecordingCard({ recording, onAnalyze }: RecordingCardProps) {
  // Helper functions for formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Mock overall score since API doesn't provide it yet
  const overallScore =
    recording.overallScore || Math.floor(Math.random() * 31) + 70;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate flex-1 mr-2">
            {recording.name}
          </CardTitle>
          <Badge
            className={`${getScoreColor(overallScore)} border-0 font-semibold`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {overallScore}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date and time info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(recording.createdAt)}</span>
          </div>
        </div>

        {/* Duration info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">
              Duration:{' '}
              <span className="font-medium">
                {formatDuration(recording.duration)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Mic className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">
              Speaking:{' '}
              <span className="font-medium">
                {formatDuration(recording.speakingTime)}
              </span>
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            onClick={() => onAnalyze(recording._id)}
            className="w-full"
            variant="default"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            View Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
