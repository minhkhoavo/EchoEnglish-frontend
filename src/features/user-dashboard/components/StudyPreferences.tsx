'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Clock,
  Target,
  Calendar,
  Settings,
  Loader2,
  AlertCircle,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} from '@/features/learning-plan-setup/services/learningPlanApi';
import type {
  UserPreferences,
  PreferredStudyTime,
  WeekDay,
  StudyTimePerDay,
} from '@/features/learning-plan-setup/types';
import {
  WEEKDAY_LABELS,
  PREFERRED_STUDY_TIME_LABELS,
  STUDY_TIME_OPTIONS,
} from '@/features/learning-plan-setup/types';
import type { RoadmapData } from '../types/roadmap.types';

export interface StudyPreferences {
  dailyGoal: number; // minutes
  preferredTime: string;
  targetScore: number;
  currentScore: number;
  studyDays: string[];
  reminderEnabled: boolean;
}

interface StudyPreferencesCardProps {
  roadmapData?: RoadmapData;
}

export const StudyPreferencesCard = ({
  roadmapData,
}: StudyPreferencesCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasChangedStudyDays, setHasChangedStudyDays] = useState(false);
  const [hasChangedWeeklyDays, setHasChangedWeeklyDays] = useState(false);

  const {
    data: userPreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
  } = useGetUserPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdating }] =
    useUpdateUserPreferencesMutation();

  // Edit state
  const [editedTargetScore, setEditedTargetScore] = useState<number>(0);
  const [editedStudyTimePerDay, setEditedStudyTimePerDay] = useState<
    StudyTimePerDay | ''
  >('');
  const [editedDays, setEditedDays] = useState<WeekDay[]>([]);
  const [editedPreferredTime, setEditedPreferredTime] = useState<
    PreferredStudyTime | ''
  >('');
  const [editedWeeklyDays, setEditedWeeklyDays] = useState<number>(0);

  // Calculate required number of study days from roadmap
  const requiredStudyDaysCount = useMemo(() => {
    if (!roadmapData?.weeklyFocuses || roadmapData.weeklyFocuses.length === 0) {
      return 0;
    }
    // Get the number of daily focuses in the current week or first week
    const currentWeekFocuses = roadmapData.weeklyFocuses[0];
    return currentWeekFocuses?.dailyFocuses?.length || 0;
  }, [roadmapData]);

  const handleOpenEditDialog = () => {
    if (userPreferences) {
      setEditedTargetScore(userPreferences.targetScore || 0);
      setEditedStudyTimePerDay(userPreferences.studyTimePerDay || '');
      setEditedDays(userPreferences.studyDaysOfWeek || []);
      setEditedPreferredTime(userPreferences.preferredStudyTime || '');
      setEditedWeeklyDays(userPreferences.weeklyStudyDays || 0);
      setHasChangedStudyDays(false);
      setHasChangedWeeklyDays(false);
    }
    setIsEditDialogOpen(true);
  };

  const handleToggleDay = (day: WeekDay) => {
    // Can only select up to requiredStudyDaysCount
    if (!editedDays.includes(day)) {
      if (editedDays.length >= requiredStudyDaysCount) {
        toast.error(
          `You can only select ${requiredStudyDaysCount} study days based on your roadmap.`
        );
        return;
      }
    }

    setHasChangedStudyDays(true);
    if (editedDays.includes(day)) {
      setEditedDays(editedDays.filter((d) => d !== day));
    } else {
      setEditedDays([...editedDays, day].sort());
    }
  };

  const handleWeeklyDaysChange = (value: string) => {
    const newValue = Number(value);
    setHasChangedWeeklyDays(true);
    setEditedWeeklyDays(newValue);
  };

  const handleSaveChanges = async () => {
    try {
      if (!userPreferences) return;

      // Validate study days count
      if (editedDays.length !== requiredStudyDaysCount) {
        toast.error(
          `You must select exactly ${requiredStudyDaysCount} study days based on your roadmap.`
        );
        return;
      }

      // Only send fields that changed
      const updates: Partial<UserPreferences> = {};

      if (editedTargetScore !== userPreferences.targetScore) {
        updates.targetScore = editedTargetScore;
      }

      if (editedStudyTimePerDay !== userPreferences.studyTimePerDay) {
        updates.studyTimePerDay = editedStudyTimePerDay as StudyTimePerDay;
      }

      if (
        JSON.stringify(editedDays) !==
        JSON.stringify(userPreferences.studyDaysOfWeek)
      ) {
        updates.studyDaysOfWeek = editedDays;
      }

      if (editedPreferredTime !== userPreferences.preferredStudyTime) {
        updates.preferredStudyTime = editedPreferredTime as PreferredStudyTime;
      }

      if (editedWeeklyDays !== userPreferences.weeklyStudyDays) {
        updates.weeklyStudyDays = editedWeeklyDays;
      }

      // If nothing changed, just close
      if (Object.keys(updates).length === 0) {
        setIsEditDialogOpen(false);
        return;
      }

      await updatePreferences(updates).unwrap();
      toast.success('Study preferences updated successfully!');

      if (hasChangedWeeklyDays) {
        toast.warning(
          'Your study days per week will be applied to the next learning plan update.'
        );
      }

      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update preferences. Please try again.');
    }
  };

  if (isLoadingPreferences) {
    return (
      <Card className="border-2 border-blue-100">
        <CardContent className="pt-6 flex items-center justify-center min-h-40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (preferencesError) {
    return (
      <Card className="border-2 border-red-100">
        <CardContent className="pt-6">
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load study preferences. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!userPreferences) {
    return (
      <Card className="border-2 border-yellow-100">
        <CardContent className="pt-6">
          <Alert className="border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              No study preferences found. Please complete the learning setup
              first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!roadmapData) {
    return null;
  }

  const progress = (
    (roadmapData.currentScore / roadmapData.targetScore) *
    100
  ).toFixed(0);

  const getDayLabel = (dayNum: WeekDay) => {
    return WEEKDAY_LABELS[dayNum];
  };

  const getPreferredTimeLabel = (time: PreferredStudyTime) => {
    return PREFERRED_STUDY_TIME_LABELS[time];
  };

  return (
    <>
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Study Preferences
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditDialog}
              disabled={isUpdating}
            >
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Daily Goal */}
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                Daily Goal
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {userPreferences.studyTimePerDay}
              </div>
              <div className="text-xs text-muted-foreground">minutes/day</div>
            </div>

            {/* Preferred Time */}
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-1 text-purple-500" />
                Study Time
              </div>
              <div className="text-lg font-semibold text-purple-600">
                {getPreferredTimeLabel(userPreferences.preferredStudyTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                preferred time
              </div>
            </div>

            {/* Target Score */}
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Target className="h-4 w-4 mr-1 text-green-500" />
                Target Score
              </div>
              <div className="text-2xl font-bold text-green-600">
                {userPreferences.targetScore}
              </div>
              <div className="text-xs text-muted-foreground">
                {roadmapData
                  ? `current: ${roadmapData.currentScore} (${progress}%)`
                  : 'current: - (-%)'}
              </div>
            </div>

            {/* Study Days */}
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-1 text-orange-500" />
                Study Days
              </div>
              <div className="flex flex-wrap gap-1">
                {userPreferences.studyDaysOfWeek?.map((day) => (
                  <Badge key={day} variant="secondary" className="text-xs">
                    {getDayLabel(day).slice(0, 3)}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {userPreferences.studyDaysOfWeek?.length || 0} days per week
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Study Preferences</DialogTitle>
            <DialogDescription>
              Modify your study preferences and schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Target Score */}
            <div>
              <Label htmlFor="target-score" className="text-base font-semibold">
                Target Score
              </Label>
              <Input
                id="target-score"
                type="number"
                min={300}
                max={990}
                step={10}
                value={editedTargetScore}
                onChange={(e) => setEditedTargetScore(Number(e.target.value))}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Your goal score (300-990)
              </p>
            </div>

            {/* Study Time Per Day */}
            <div>
              <Label htmlFor="study-time" className="text-base font-semibold">
                Daily Study Time
              </Label>
              <Select
                value={editedStudyTimePerDay?.toString() || ''}
                onValueChange={(value) =>
                  setEditedStudyTimePerDay(Number(value) as StudyTimePerDay)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select daily study time" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                How much time you can study each day
              </p>
            </div>

            {/* Preferred Study Time */}
            <div>
              <Label
                htmlFor="preferred-time"
                className="text-base font-semibold"
              >
                Preferred Study Time
              </Label>
              <Select
                value={editedPreferredTime}
                onValueChange={(value) =>
                  setEditedPreferredTime(value as PreferredStudyTime)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PREFERRED_STUDY_TIME_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Study Days Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Study Days ({editedDays.length}/{requiredStudyDaysCount})
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select exactly <strong>{requiredStudyDaysCount} days</strong>{' '}
                based on your current learning roadmap. You can choose which
                specific days work best for you.
              </p>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(WEEKDAY_LABELS).map(([dayNum, dayLabel]) => {
                  const day = Number(dayNum) as WeekDay;
                  const isSelected = editedDays.includes(day);
                  const canSelect =
                    isSelected || editedDays.length < requiredStudyDaysCount;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      disabled={!canSelect}
                      className={`p-2 rounded-lg text-center transition-all border-2 text-sm font-semibold ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : canSelect
                            ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {dayLabel.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekly Study Days */}
            <div>
              <Label htmlFor="weekly-days" className="text-base font-semibold">
                Days Per Week (Optional)
              </Label>
              <Select
                value={editedWeeklyDays?.toString() || ''}
                onValueChange={handleWeeklyDaysChange}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select days per week" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days} {days === 1 ? 'day' : 'days'} per week
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                This preference will be applied to your future learning plans
              </p>
            </div>

            {/* Warning for Study Days Change */}
            {hasChangedStudyDays && (
              <Alert className="border-blue-500 bg-blue-50">
                <ScrollText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your study schedule has been updated. This takes effect
                  immediately.
                </AlertDescription>
              </Alert>
            )}

            {/* Warning for Weekly Days Change */}
            {hasChangedWeeklyDays && (
              <Alert className="border-amber-500 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Changing days per week will be applied to your next learning
                  plan update. Your current plan remains unchanged.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={
                isUpdating || editedDays.length !== requiredStudyDaysCount
              }
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editedDays.length !== requiredStudyDaysCount ? (
                `Select ${requiredStudyDaysCount - editedDays.length} more day(s)`
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
