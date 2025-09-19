/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/core/store/store';
import { updateSession } from '@/features/tests/slices/testSlice';
import { formatMs } from '@/features/tests/utils/formatMs';

interface TestTimerProps {
  className?: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({ className = '' }) => {
  const currentSession = useAppSelector((state) => state.test.currentSession);
  const dispatch = useAppDispatch();

  // Use refs to track stable values that shouldn't cause re-renders
  const sessionStartTimeMs = currentSession
    ? new Date(currentSession.startTime).getTime()
    : 0;
  const sessionId = currentSession?.startTime; // Use startTime as unique session identifier
  const isRestoredSession = !!currentSession?.savedAt;

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownStartRef = useRef<number>(0);
  const initialRemainingRef = useRef<number>(0);

  // Countdown effect: only restart when session changes (not on answer updates)
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!sessionStartTimeMs || !currentSession) {
      setTimeRemaining(0);
      return;
    }

    // Calculate initial remaining time for this countdown cycle
    let startingRemainingMs: number;

    if (isRestoredSession) {
      // Restored session: use saved timeRemaining
      startingRemainingMs = currentSession.timeRemaining;
    } else {
      // New session: use initial time limit
      startingRemainingMs = currentSession.timeRemaining;
    }

    // Set refs for countdown calculations
    countdownStartRef.current = Date.now();
    initialRemainingRef.current = startingRemainingMs;

    // Set initial display
    setTimeRemaining(Math.floor(startingRemainingMs / 1000));

    // Start countdown timer
    timerRef.current = setInterval(() => {
      const elapsedSinceCountdown = Date.now() - countdownStartRef.current;
      const remainingMs = Math.max(
        0,
        initialRemainingRef.current - elapsedSinceCountdown
      );
      const remainingSec = Math.floor(remainingMs / 1000);

      setTimeRemaining(remainingSec);

      // Update timeRemaining in Redux every 10 seconds to save to IndexedDB
      if (elapsedSinceCountdown % 10000 < 1000 && remainingMs > 0) {
        dispatch(
          updateSession({
            timeRemaining: remainingMs,
            savedAt: new Date().toISOString(),
          })
        );
      }

      if (remainingMs <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionId]); // Only restart timer when session ID changes, not on answer updates

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
