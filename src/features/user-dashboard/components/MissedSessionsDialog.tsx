import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, CheckCircle } from 'lucide-react';
import type { CheckMissedSessionsResponse } from '../types/dashboard.types';
import {
  useGetDailyLessonQuery,
  useGetActiveRoadmapQuery,
  useGetListeningReadingChartDataQuery,
} from '../services/dashboardApi';

interface MissedSessionsDialogProps {
  open: boolean;
  onClose: () => void;
  data: CheckMissedSessionsResponse['data'] | null;
}

export function MissedSessionsDialog({
  open,
  onClose,
  data,
}: MissedSessionsDialogProps) {
  // Get refetch functions to reload data when dialog closes
  const { refetch: refetchDailyLesson } = useGetDailyLessonQuery();
  const { refetch: refetchRoadmap } = useGetActiveRoadmapQuery();
  const { refetch: refetchChartData } = useGetListeningReadingChartDataQuery();

  const handleClose = async () => {
    // Invalidate all dashboard related tags to reload data
    try {
      await Promise.all([
        refetchDailyLesson(),
        refetchRoadmap(),
        refetchChartData(),
      ]);
    } catch (error) {
      console.error('Failed to refetch dashboard data:', error);
    } finally {
      // Close dialog after refetching
      onClose();
    }
  };

  if (!data || !data.hasMissedSessions) return null;

  const getDialogContent = () => {
    if (data.action === 'mark_skipped') {
      return {
        title: 'Missed Study Sessions Detected',
        description: `You've missed ${data.missedCount} study ${data.missedCount === 1 ? 'session' : 'sessions'}. Don't worry! We've marked ${data.missedCount === 1 ? 'it' : 'them'} as skipped, and the content will be reviewed in your upcoming lessons to ensure you stay on track with your learning goals.`,
        icon: <AlertCircle className="h-6 w-6 text-amber-500" />,
        iconBg: 'bg-amber-50',
      };
    } else if (data.action === 'regenerate_week') {
      return {
        title: 'Learning Plan Adjusted',
        description: `You've missed multiple study sessions (${data.missedCount} sessions). To help you get back on track, we've automatically adjusted your weekly roadmap. Your learning plan has been recalibrated to ensure you can catch up effectively while maintaining steady progress toward your target score.`,
        icon: <Calendar className="h-6 w-6 text-blue-500" />,
        iconBg: 'bg-blue-50',
      };
    }

    // Default case
    return {
      title: 'Session Update',
      description: data.message,
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      iconBg: 'bg-green-50',
    };
  };

  const content = getDialogContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${content.iconBg}`}>
              {content.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">
                {content.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 leading-relaxed">
                {content.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Show missed sessions details if available */}
        {data.missedSessions && data.missedSessions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Missed Sessions:
            </h4>
            <ul className="space-y-1">
              {data.missedSessions.slice(0, 5).map((session, index) => (
                <li
                  key={session.sessionId || index}
                  className="text-xs text-gray-600"
                >
                  • Week {session.weekNumber}, Day {session.dayNumber}
                  {session.title && ` - ${session.title}`}
                  {session.scheduledDate && (
                    <span className="text-gray-400 ml-1">
                      ({new Date(session.scheduledDate).toLocaleDateString()})
                    </span>
                  )}
                </li>
              ))}
              {data.missedSessions.length > 5 && (
                <li className="text-xs text-gray-500 italic">
                  ... and {data.missedSessions.length - 5} more sessions
                </li>
              )}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
