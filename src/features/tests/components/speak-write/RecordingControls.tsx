import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Clock } from 'lucide-react';

interface RecordingControlsProps {
  currentPhase: 'idle' | 'preparation' | 'response' | 'completed';
  isRecording: boolean;
  recordedBlob: Blob | null;
  responseTimeLeft: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRecordAgain: () => void;
  preparationTime: number;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  currentPhase,
  isRecording,
  recordedBlob,
  responseTimeLeft,
  onStartRecording,
  onStopRecording,
  onRecordAgain,
  preparationTime,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentPhase === 'idle') {
    return null;
  }

  if (currentPhase === 'preparation') {
    return (
      <div className="flex-1 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700 font-medium">
          📚 Preparation in progress... Get ready to speak!
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Recording will start automatically when preparation time ends.
        </p>
      </div>
    );
  }

  if (currentPhase === 'response') {
    if (!isRecording && !recordedBlob) {
      return (
        <Button onClick={onStartRecording} className="flex-1">
          <Mic className="h-4 w-4 mr-2" />
          Start Recording
        </Button>
      );
    }

    if (!isRecording && recordedBlob) {
      return (
        <div className="flex gap-2 flex-1">
          <Button onClick={onRecordAgain} variant="outline" className="flex-1">
            <Mic className="h-4 w-4 mr-2" />
            Record Again
          </Button>
          <div className="text-sm text-muted-foreground flex items-center">
            Time remaining: {formatTime(responseTimeLeft)}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-700">
              Recording...
            </span>
          </div>
          <Button onClick={onStopRecording} variant="outline" size="sm">
            <MicOff className="h-4 w-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>
    );
  }

  if (currentPhase === 'completed' && recordedBlob) {
    return (
      <Button onClick={onRecordAgain} variant="outline" className="flex-1">
        <Mic className="h-4 w-4 mr-2" />
        Record Again
      </Button>
    );
  }

  return null;
};
