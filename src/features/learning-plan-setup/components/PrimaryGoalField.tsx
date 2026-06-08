import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import type { PrimaryGoal } from '../types';
import { PRIMARY_GOAL_LABELS } from '../types';

interface PrimaryGoalFieldProps {
  value?: PrimaryGoal;
  onChange: (value: PrimaryGoal) => void;
  disabled?: boolean;
}

export function PrimaryGoalField({
  value,
  onChange,
  disabled,
}: PrimaryGoalFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="primaryGoal">Primary Goal *</Label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as PrimaryGoal)}
        disabled={disabled}
      >
        <SelectTrigger id="primaryGoal">
          <SelectValue placeholder="Select your primary goal" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(PRIMARY_GOAL_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Choose your main learning objective
      </p>
    </div>
  );
}
