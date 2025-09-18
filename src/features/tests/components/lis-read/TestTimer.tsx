import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useAppSelector } from '@/core/store/store';
import { formatMs } from '@/features/tests/utils/formatMs';

interface TestTimerProps {
  className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({ className = '' }) => {
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const currentSession = useAppSelector((state) => state.test.currentSession);

  // Calculate time remaining (ms) and update every second
  useEffect(() => {
    if (!currentSession) {
      setTimeRemaining(0);
      return;
    }

    // Nếu timeRemaining là số ms còn lại, chỉ cần đếm lùi
    let remainingMs = currentSession.timeRemaining;
    setTimeRemaining(Math.floor(remainingMs / 1000));

    const timer = setInterval(() => {
      remainingMs -= 1000;
      setTimeRemaining(Math.max(0, Math.floor(remainingMs / 1000)));
      if (remainingMs <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

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
      <span>{formatMs(timeRemaining * 1000)}</span>
    </div>
  );
};
