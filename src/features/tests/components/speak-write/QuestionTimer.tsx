import React from 'react';
import { Clock } from 'lucide-react';

interface QuestionTimerProps {
  currentPhase: 'idle' | 'preparation' | 'response' | 'completed';
  preparationTime: number;
  responseTime: number;
  preparationTimeLeft: number;
  responseTimeLeft: number;
  onStart?: () => void;
  showStartButton?: boolean;
}

export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  currentPhase,
  preparationTime,
  responseTime,
  preparationTimeLeft,
  responseTimeLeft,
  onStart,
  showStartButton = false,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseProgress = () => {
    if (currentPhase === 'idle') {
      return 0;
    } else if (currentPhase === 'preparation') {
      if (preparationTimeLeft <= 1) return 100;
      return ((preparationTime - preparationTimeLeft) / preparationTime) * 100;
    } else if (currentPhase === 'response') {
      if (responseTimeLeft <= 1) return 100;
      return ((responseTime - responseTimeLeft) / responseTime) * 100;
    }
    return 100;
  };

  const getCurrentTime = () => {
    if (currentPhase === 'idle') return formatTime(preparationTime);
    if (currentPhase === 'preparation') return formatTime(preparationTimeLeft);
    if (currentPhase === 'response') return formatTime(responseTimeLeft);
    return '0:00';
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'idle':
        return 'Ready to Start';
      case 'preparation':
        return 'Preparation Time';
      case 'response':
        return 'Response Time';
      case 'completed':
        return 'Time Complete';
      default:
        return '';
    }
  };

  return (
    <div className="mt-4 p-3 xl:p-4 bg-muted rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm xl:text-base">
          {getPhaseLabel()}
        </span>
        <div className="flex items-center gap-1 xl:gap-2">
          <Clock className="h-3 xl:h-4 w-3 xl:w-4" />
          <span className="font-mono text-sm xl:text-base">
            {getCurrentTime()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              currentPhase === 'preparation'
                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                : currentPhase === 'response'
                  ? 'bg-gradient-to-r from-orange-400 to-red-600'
                  : 'bg-gradient-to-r from-green-400 to-green-600'
            }`}
            style={{ width: `${getPhaseProgress()}%` }}
          />
        </div>

        {/* Phase indicator dots */}
        <div className="flex gap-1 mt-2 px-1">
          <div
            className={`w-2 h-2 rounded-full ${
              currentPhase === 'preparation' ||
              currentPhase === 'response' ||
              currentPhase === 'completed'
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              currentPhase === 'response' || currentPhase === 'completed'
                ? 'bg-orange-500'
                : 'bg-gray-300'
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              currentPhase === 'completed' ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Start Button for Writing Timer */}
      {showStartButton && currentPhase === 'idle' && onStart && (
        <button
          onClick={onStart}
          className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Clock className="h-4 w-4 mr-2 inline" />
          Start Timer ({formatTime(preparationTime + responseTime)})
        </button>
      )}
    </div>
  );
};
