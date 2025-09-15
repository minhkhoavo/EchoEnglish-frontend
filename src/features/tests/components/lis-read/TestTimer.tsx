import React from 'react';
import { Clock } from 'lucide-react';

interface TestTimerProps {
  timeRemaining: number; // in seconds
  className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({
  timeRemaining,
  className = '',
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono ${className}`}
    >
      <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
};
