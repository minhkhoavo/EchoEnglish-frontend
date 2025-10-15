import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import type {
  StudyTimePerDay,
  PreferredStudyTime,
  CurrentLevel,
} from '../types';
import {
  STUDY_TIME_OPTIONS,
  PREFERRED_STUDY_TIME_LABELS,
  CURRENT_LEVEL_LABELS,
} from '../types';

interface StudyPreferencesFieldsProps {
  studyTimePerDay?: StudyTimePerDay;
  weeklyStudyDays?: number;
  preferredStudyTime?: PreferredStudyTime;
  currentLevel?: CurrentLevel;
  onStudyTimeChange: (value: StudyTimePerDay) => void;
  onWeeklyDaysChange: (value: number) => void;
  onPreferredTimeChange: (value: PreferredStudyTime) => void;
  onCurrentLevelChange: (value: CurrentLevel) => void;
  disabled?: boolean;
}

export function StudyPreferencesFields({
  studyTimePerDay,
  weeklyStudyDays,
  preferredStudyTime,
  currentLevel,
  onStudyTimeChange,
  onWeeklyDaysChange,
  onPreferredTimeChange,
  onCurrentLevelChange,
  disabled,
}: StudyPreferencesFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="studyTimePerDay">Study Time Per Day *</Label>
        <Select
          value={studyTimePerDay?.toString()}
          onValueChange={(val) =>
            onStudyTimeChange(Number(val) as StudyTimePerDay)
          }
          disabled={disabled}
        >
          <SelectTrigger id="studyTimePerDay">
            <SelectValue placeholder="Select study time" />
          </SelectTrigger>
          <SelectContent>
            {STUDY_TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time.toString()}>
                {time} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          How much time can you dedicate daily?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weeklyStudyDays">Weekly Study Days *</Label>
        <Select
          value={weeklyStudyDays?.toString()}
          onValueChange={(val) => onWeeklyDaysChange(Number(val))}
          disabled={disabled}
        >
          <SelectTrigger id="weeklyStudyDays">
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
        <p className="text-sm text-muted-foreground">How many days per week?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredStudyTime">Preferred Study Time *</Label>
        <Select
          value={preferredStudyTime}
          onValueChange={(val) =>
            onPreferredTimeChange(val as PreferredStudyTime)
          }
          disabled={disabled}
        >
          <SelectTrigger id="preferredStudyTime">
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
        <p className="text-sm text-muted-foreground">When do you study best?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentLevel">Current Level *</Label>
        <Select
          value={currentLevel}
          onValueChange={(val) => onCurrentLevelChange(val as CurrentLevel)}
          disabled={disabled}
        >
          <SelectTrigger id="currentLevel">
            <SelectValue placeholder="Select your level" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CURRENT_LEVEL_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Your current English level
        </p>
      </div>
    </div>
  );
}
