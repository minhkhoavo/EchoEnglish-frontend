import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Zap,
  Clock,
  Target,
  Play,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import type { WeaknessDrill, PartNumber } from '../types/analysis';

interface DrillContentModalProps {
  drill: WeaknessDrill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDrill?: (drillId: string) => void;
}

export function DrillContentModal({
  drill,
  open,
  onOpenChange,
  onStartDrill,
}: DrillContentModalProps) {
  if (!drill) return null;

  const drillId = drill._id || drill.id || '';
  const hasCompleted = drill.completed || false;
  const attempts = drill.attempts || 0;

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-[#10b981] border-[#10b981]',
      intermediate: 'bg-[#f59e0b] border-[#f59e0b]',
      advanced: 'bg-[#dc2626] border-[#dc2626]',
    };
    return colors[difficulty as keyof typeof colors] || colors.beginner;
  };

  const handleStart = () => {
    if (onStartDrill && drillId) {
      onStartDrill(drillId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{drill.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {drill.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="p-2 bg-gradient-to-br from-[#10b981] to-[#059669] rounded flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#0f172a] mb-1">
                {drill.title}
              </h3>
              <p className="text-sm text-[#64748b] leading-relaxed">
                {drill.description}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-3 bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe]">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-xs font-semibold text-[#64748b]">
                  Questions
                </span>
              </div>
              <p className="text-xl font-bold text-[#0f172a]">
                {drill.totalQuestions}
              </p>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-[#fef3c7] to-[#fde68a] border border-[#fde68a]">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="text-xs font-semibold text-[#64748b]">
                  Duration
                </span>
              </div>
              <p className="text-xl font-bold text-[#0f172a]">
                {drill.estimatedTime || 10}
                <span className="text-xs text-[#64748b] ml-1">min</span>
              </p>
            </Card>

            <Card className="p-3 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs font-semibold text-[#64748b]">
                  Attempts
                </span>
              </div>
              <p className="text-xl font-bold text-[#0f172a]">{attempts}</p>
            </Card>
          </div>

          {/* Details */}
          <Card className="p-3 border border-[#e5e7eb]">
            <div className="space-y-2">
              {/* Difficulty */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748b]">
                  Difficulty Level
                </span>
                <Badge
                  className={`${getDifficultyColor(drill.difficulty)} text-white border-0 text-xs`}
                >
                  {drill.difficulty.charAt(0).toUpperCase() +
                    drill.difficulty.slice(1)}
                </Badge>
              </div>

              {/* Target Skills */}
              {drill.skillTags && (
                <div>
                  <span className="text-xs font-semibold text-[#64748b] mb-1.5 block">
                    Target Skill
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-[#eff6ff] border-[#3b82f6] text-[#3b82f6] text-xs"
                  >
                    {drill.skillTags.skillCategory}
                  </Badge>
                </div>
              )}

              {/* Parts Covered */}
              {drill.partNumbers && drill.partNumbers.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-[#64748b] mb-1.5 block">
                    TOEIC Parts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {drill.partNumbers.map((partNum) => (
                      <Badge
                        key={partNum}
                        variant="outline"
                        className="text-xs"
                      >
                        Part {partNum}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Completion Status */}
          {hasCompleted && (
            <Card className="p-3 bg-gradient-to-r from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm font-semibold text-[#166534]">
                  You've completed this drill!
                </span>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white h-10 text-sm font-semibold"
              onClick={handleStart}
            >
              <Play className="w-4 h-4 mr-2" />
              {hasCompleted ? 'Practice Again' : 'Start Drill'}
            </Button>
            <Button
              variant="outline"
              className="border-[#e5e7eb] hover:bg-[#f8fafc]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
