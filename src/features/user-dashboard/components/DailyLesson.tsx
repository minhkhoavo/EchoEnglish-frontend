import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Zap,
  Target,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  DailyLessonData,
  DailyLessonPlanItem,
} from '../types/dashboard.types';
import { LearningResourceCard } from '@/features/lr-analyze/components/LearningResourceCard';
import { DrillContentModal } from '@/features/lr-analyze/components/DrillContentModal';
import type { WeaknessDrill } from '@/features/lr-analyze/types/analysis';
import { useGetDailyLessonQuery } from '../services/dashboardApi';

interface DailyLessonProps {
  dailyLesson: DailyLessonData | null;
  loading?: boolean;
  onItemComplete?: (itemId: string) => void;
  onResourceComplete?: (resourceId: string) => void;
  onResourceTimeSpent?: (
    itemId: string,
    resourceId: string,
    timeSpent: number
  ) => void;
}

export function DailyLesson({
  dailyLesson,
  loading = false,
  onItemComplete,
  onResourceComplete,
  onResourceTimeSpent,
}: DailyLessonProps) {
  const navigate = useNavigate();
  const [selectedDrill, setSelectedDrill] = useState<WeaknessDrill | null>(
    null
  );
  const [drillModalOpen, setDrillModalOpen] = useState(false);
  const [isLoadingDailyLesson, setIsLoadingDailyLesson] = useState(false);
  const { refetch } = useGetDailyLessonQuery();

  const handleDrillClick = (drill: WeaknessDrill) => {
    setSelectedDrill(drill);
    setDrillModalOpen(true);
  };

  const handleStartDrill = (drillId: string) => {
    const drill = selectedDrill;
    if (drill && drill.practiceQuestionIds && dailyLesson) {
      navigate('/practice-drill', {
        state: {
          questionIds: drill.practiceQuestionIds,
          drillData: drill,
          sessionId: dailyLesson._id,
        },
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="p-3 bg-gray-200 rounded-lg">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded mb-2 w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!dailyLesson) {
    const handleGenerateDailyLesson = async () => {
      setIsLoadingDailyLesson(true);
      try {
        const result = await refetch();
        if (result.data?.data) {
          toast.success('Daily lesson loaded successfully!');
        } else {
          toast.error(
            'No daily lesson available yet. Please set up your learning plan first.'
          );
          navigate('/learning-plan/setup');
        }
      } catch (error) {
        toast.error('Failed to load daily lesson');
      } finally {
        setIsLoadingDailyLesson(false);
      }
    };

    return (
      <Card className="p-5 border border-[#e5e7eb]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-[#f1f5f9] rounded-lg">
              <Calendar className="w-6 h-6 text-[#64748b]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#0f172a]">
                No Daily Lesson Available
              </h3>
              <p className="text-sm text-[#64748b]">
                Complete your diagnostic test to generate personalized daily
                lessons.
              </p>
            </div>
          </div>
          <Button
            onClick={handleGenerateDailyLesson}
            disabled={isLoadingDailyLesson}
            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            {isLoadingDailyLesson ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Today's Lesson
              </>
            )}
          </Button>
        </div>
      </Card>
    );
  }

  const completedItems = dailyLesson.planItems.filter(
    (item) => item.status === 'completed'
  ).length;
  const skippedItems = dailyLesson.planItems.filter(
    (item) => item.status === 'skipped'
  ).length;
  console.log('skippedItems:', skippedItems);
  const totalItems = dailyLesson.planItems.length;
  const activeItems = totalItems - skippedItems; // Exclude skipped from total
  const progressPercentage =
    activeItems > 0 ? (completedItems / activeItems) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-5 bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border border-[#bbf7d0]">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#10b981] rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-xl font-bold text-[#0f172a] mb-1">
                  {dailyLesson.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-[#475569]">
                  <span>Week {dailyLesson.weekNumber}</span>
                  <span>• Learning</span>
                  {/* <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{dailyLesson.totalEstimatedTime} min</span>
                  </div> */}
                </div>
              </div>
              <Badge className="bg-[#10b981] text-white border-0">
                {completedItems}/{activeItems} completed
              </Badge>
            </div>

            <p className="text-sm text-[#475569] leading-relaxed mb-3">
              {dailyLesson.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#64748b]">Progress</span>
                <span className="text-xs text-[#64748b]">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Target Skills */}
            <div className="flex flex-wrap gap-1">
              {dailyLesson.targetSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-[#10b981] text-[#10b981]"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Learning Activities */}
      {dailyLesson.planItems.map((item, index) => {
        const isCompleted = item.status === 'completed';
        const isInProgress = item.status === 'in-progress';
        const isSkipped = item.status === 'skipped';
        const totalResources = item.resources.length;
        const totalDrills = item.practiceDrills.length;
        const completedResources = item.resources.filter(
          (r) => r.completed
        ).length;
        const completedDrills = item.practiceDrills.filter(
          (d) => d.completed
        ).length;

        return (
          <Card
            key={item._id}
            className={`p-5 ${isCompleted ? 'bg-gray-50 opacity-75' : isSkipped ? 'bg-[#fee2e2] opacity-75 border border-[#fecaca]' : 'bg-white'} ${isInProgress ? 'border-2 border-blue-400' : ''}`}
          >
            {/* Item Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={`text-xs ${
                      isCompleted
                        ? 'bg-[#10b981] text-white'
                        : isInProgress
                          ? 'bg-[#3b82f6] text-white'
                          : isSkipped
                            ? 'bg-[#fca5a5] text-[#991b1b]'
                            : 'bg-[#94a3b8] text-white'
                    }`}
                  >
                    Step {index + 1}
                  </Badge>
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                  )}
                  {isInProgress && (
                    <Badge
                      variant="outline"
                      className="text-xs border-blue-400 text-blue-600"
                    >
                      In Progress
                    </Badge>
                  )}
                  {isSkipped && (
                    <Badge className="text-xs bg-[#fecaca] text-[#dc2626] border-0">
                      Skipped
                    </Badge>
                  )}
                  {/* Activity completion status */}
                  {!isCompleted && (totalResources > 0 || totalDrills > 0) && (
                    <Badge variant="outline" className="text-xs">
                      {completedResources + completedDrills}/
                      {totalResources + totalDrills} completed
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#64748b] leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Target Weakness */}
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-sm text-[#64748b]">
                    Target: {item.targetWeakness.skillName} (
                    {item.targetWeakness.severity})
                  </span>
                </div>

                {/* Skills to Improve */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.skillsToImprove.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {!isCompleted && !isSkipped && onItemComplete && (
                <Button
                  className="bg-[#10b981] hover:bg-[#059669] text-white"
                  onClick={() => onItemComplete(item._id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete
                </Button>
              )}
            </div>

            {/* Learning Resources Section */}
            {totalResources > 0 && !isSkipped && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#3b82f6]" />
                  Learning Resources ({totalResources})
                </h4>
                <div className="grid gap-3">
                  {item.resources.map((resource) => (
                    <LearningResourceCard
                      key={resource._id}
                      resource={resource}
                      onComplete={onResourceComplete}
                      onTimeSpent={(resourceId, timeSpent) => {
                        if (onResourceTimeSpent) {
                          onResourceTimeSpent(item._id, resourceId, timeSpent);
                        }
                      }}
                      showCompletedState={true}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Practice Drills Section */}
            {totalDrills > 0 && !isSkipped && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#0f172a] mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#10b981]" />
                  Practice Drills ({completedDrills}/{totalDrills})
                </h4>
                <div className="grid gap-3">
                  {item.practiceDrills.map((drill, drillIndex) => {
                    const isDrillCompleted = drill.completed;
                    return (
                      <Card
                        key={drill._id || drillIndex}
                        className={`p-3 border transition-colors ${
                          isDrillCompleted
                            ? 'border-[#10b981] bg-[#f0fdf4]'
                            : 'border-[#e5e7eb] hover:border-[#10b981]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-semibold text-[#0f172a]">
                                {drill.title}
                              </h5>
                              {isDrillCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                              )}
                            </div>
                            <p className="text-xs text-[#64748b] mb-2">
                              {drill.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{drill.estimatedTime || 15} min</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {drill.difficulty || 'Medium'}
                              </Badge>
                              {drill.minCorrectAnswers && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-amber-400 text-amber-600"
                                >
                                  Min: {drill.minCorrectAnswers} correct
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className={`${
                              isDrillCompleted
                                ? 'bg-[#94a3b8] hover:bg-[#64748b]'
                                : 'bg-[#10b981] hover:bg-[#059669]'
                            } text-white`}
                            onClick={() => handleDrillClick(drill)}
                            // disabled={isDrillCompleted}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {isDrillCompleted ? 'Review' : 'Start'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity Type Badge */}
            <div className="border-t pt-3">
              <Badge
                variant="outline"
                className={`text-xs ${item.activityType === 'learn' ? 'border-[#3b82f6] text-[#3b82f6]' : 'border-[#10b981] text-[#10b981]'}`}
              >
                {item.activityType === 'learn'
                  ? '📚 Learning Activity'
                  : '🎯 Practice Activity'}
              </Badge>
            </div>
          </Card>
        );
      })}

      {/* Summary */}
      {totalItems > 0 && (
        <Card className="p-4 border border-[#e5e7eb] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#eff6ff] rounded-lg">
              <Target className="w-5 h-5 text-[#2563eb]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#0f172a] mb-1">
                Today's Learning Summary
              </h3>
              <p className="text-xs text-[#64748b]">
                {completedItems === totalItems
                  ? '🎉 Congratulations! You completed all tasks for today.'
                  : `Keep going! Complete ${totalItems - completedItems} more ${totalItems - completedItems === 1 ? 'task' : 'tasks'} to finish today's lesson.`}
              </p>
            </div>
            {completedItems === totalItems && (
              <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
            )}
          </div>
        </Card>
      )}

      {/* Drill Content Modal */}
      {selectedDrill && (
        <DrillContentModal
          drill={selectedDrill}
          open={drillModalOpen}
          onOpenChange={setDrillModalOpen}
          onStartDrill={handleStartDrill}
        />
      )}
    </div>
  );
}
