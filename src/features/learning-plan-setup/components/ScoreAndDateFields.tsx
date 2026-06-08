import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Calendar } from '../../../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Button } from '../../../components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';

interface ScoreAndDateFieldsProps {
  targetScore?: number;
  targetDate?: string;
  onTargetScoreChange: (value: number) => void;
  onTargetDateChange: (value: string) => void;
  disabled?: boolean;
}

export function ScoreAndDateFields({
  targetScore,
  targetDate,
  onTargetScoreChange,
  onTargetDateChange,
  disabled,
}: ScoreAndDateFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="targetScore">Target Score *</Label>
        <Input
          id="targetScore"
          type="number"
          min={100}
          max={990}
          step={10}
          value={targetScore || ''}
          onChange={(e) => onTargetScoreChange(Number(e.target.value))}
          placeholder="e.g., 850"
          disabled={disabled}
        />
        <p className="text-sm text-muted-foreground">TOEIC score (100-990)</p>
      </div>

      <div className="space-y-2">
        <Label>Target Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !targetDate && 'text-muted-foreground'
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {targetDate ? format(new Date(targetDate), 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={targetDate ? new Date(targetDate) : undefined}
              onSelect={(date) =>
                date && onTargetDateChange(date.toISOString())
              }
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-sm text-muted-foreground">
          When do you want to achieve this?
        </p>
      </div>
    </div>
  );
}
