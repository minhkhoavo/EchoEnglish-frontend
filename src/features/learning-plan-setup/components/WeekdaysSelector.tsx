import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import type { WeekDay } from '../types';
import { WEEKDAY_LABELS } from '../types';

interface WeekdaysSelectorProps {
  selectedDays: WeekDay[];
  onChange: (days: WeekDay[]) => void;
  disabled?: boolean;
}

export function WeekdaysSelector({
  selectedDays,
  onChange,
  disabled,
}: WeekdaysSelectorProps) {
  const toggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="space-y-3">
      <Label>Study Days of Week *</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {Object.entries(WEEKDAY_LABELS).map(([day, label]) => {
          const dayNum = Number(day) as WeekDay;
          return (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={`day-${day}`}
                checked={selectedDays.includes(dayNum)}
                onCheckedChange={() => toggleDay(dayNum)}
                disabled={disabled}
              />
              <label
                htmlFor={`day-${day}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label.slice(0, 3)}
              </label>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Select the days you want to study (at least 1)
      </p>
    </div>
  );
}
