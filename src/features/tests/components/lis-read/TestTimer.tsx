import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAppSelector } from '@/core/store/store';

interface TestTimerProps {
  className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({ className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const currentSession = useAppSelector((state) => state.test.currentSession);

  // Calculate time remaining based on IndexedDB session data
  useEffect(() => {
    if (!currentSession) {
      setTimeRemaining(0);
      return;
    }

    const calculateTimeRemaining = () => {
      const currentTime = Date.now();

      // Use savedAt if available (for resumed sessions), otherwise use startTime
      const referenceTime = currentSession.savedAt
        ? new Date(currentSession.savedAt).getTime()
        : new Date(currentSession.startTime).getTime();

      // Validate reference time
      if (isNaN(referenceTime)) {
        console.error('Invalid reference time:', {
          savedAt: currentSession.savedAt,
          startTime: currentSession.startTime,
        });
        return 0;
      }

      // Handle different timeLimit formats
      let endTime: number;
      if (typeof currentSession.timeLimit === 'string') {
        // If timeLimit is stored as ISO string (end time)
        endTime = new Date(currentSession.timeLimit).getTime();

        // Validate endTime
        if (isNaN(endTime)) {
          console.error('Invalid timeLimit:', currentSession.timeLimit);
          return 0;
        }
      } else {
        // If timeLimit is stored as duration in milliseconds
        const startTime = new Date(currentSession.startTime).getTime();
        endTime = startTime + currentSession.timeLimit;
      }

      const remaining = Math.max(0, endTime - currentTime);

      // Convert to seconds
      return Math.floor(remaining / 1000);
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // Auto-submit when time expires (could be handled in parent component)
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show warning color when time is running low (less than 10 minutes)
  const isLowTime = timeRemaining <= 600; // 10 minutes
  const isCriticalTime = timeRemaining <= 300; // 5 minutes

  return (
    <div
      className={`flex items-center gap-1 xl:gap-2 text-sm xl:text-lg font-mono ${
        isCriticalTime
          ? 'text-red-600 dark:text-red-400 animate-pulse'
          : isLowTime
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-foreground'
      } ${className}`}
    >
      <Clock className="h-4 xl:h-5 w-4 xl:w-5" />
      <span>{formatTime(timeRemaining)}</span>
    </div>
  );
};
