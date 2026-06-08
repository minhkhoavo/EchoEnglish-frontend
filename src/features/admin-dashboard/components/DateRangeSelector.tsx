import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Check } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type {
  DateRangeOption,
  DashboardDateRange,
} from '../types/dashboard.types';

interface DateRangeSelectorProps {
  value: string;
  onChange: (option: DateRangeOption) => void;
  className?: string;
}

// Predefined date range options
const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    label: 'Last 7 days',
    value: 'last-7-days',
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    by: 'day',
  },
  {
    label: 'Last 30 days',
    value: 'last-30-days',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    by: 'day',
  },
  {
    label: 'Last 3 months',
    value: 'last-3-months',
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    by: 'month',
  },
  {
    label: 'Last 6 months',
    value: 'last-6-months',
    from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
    by: 'month',
  },
  {
    label: 'This year',
    value: 'this-year',
    from: `${new Date().getFullYear()}-01-01`,
    to: new Date().toISOString().split('T')[0],
    by: 'month',
  },
  {
    label: 'Last year',
    value: 'last-year',
    from: `${new Date().getFullYear() - 1}-01-01`,
    to: `${new Date().getFullYear() - 1}-12-31`,
    by: 'month',
  },
  {
    label: 'Custom Range',
    value: 'custom',
    from: '',
    to: '',
    by: 'day',
  },
];

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps) {
  const selectedOption = DATE_RANGE_OPTIONS.find(
    (option) => option.value === value
  );
  const [customFrom, setCustomFrom] = useState<Date | undefined>(
    selectedOption?.from ? new Date(selectedOption.from) : undefined
  );
  const [customTo, setCustomTo] = useState<Date | undefined>(
    selectedOption?.to ? new Date(selectedOption.to) : undefined
  );
  const [customBy, setCustomBy] = useState<'day' | 'month'>('day');

  // Update custom state when selectedOption changes
  React.useEffect(() => {
    if (selectedOption) {
      setCustomFrom(
        selectedOption.from ? new Date(selectedOption.from) : undefined
      );
      setCustomTo(selectedOption.to ? new Date(selectedOption.to) : undefined);
      setCustomBy(
        selectedOption.by === 'year'
          ? 'month'
          : (selectedOption.by as 'day' | 'month')
      );
    }
  }, [selectedOption]);

  const handleCustomRangeApply = () => {
    if (customFrom && customTo) {
      const customOption: DateRangeOption = {
        label: 'Custom Range',
        value: 'custom',
        from: format(customFrom, 'yyyy-MM-dd'),
        to: format(customTo, 'yyyy-MM-dd'),
        by: customBy,
      };
      onChange(customOption);
    }
  };

  const isCustomRange = value === 'custom';

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-fit">
            <Calendar className="h-4 w-4" />
            <span>Date Range:</span>
          </div>
          <Select
            value={value}
            onValueChange={(newValue: string) => {
              const option = DATE_RANGE_OPTIONS.find(
                (opt) => opt.value === newValue
              );
              if (option) {
                onChange(option);
              }
            }}
          >
            <SelectTrigger className="w-48 h-8">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isCustomRange && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-8 min-w-40 justify-start text-left font-normal text-xs',
                      !customFrom && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    <span className="truncate">
                      {customFrom ? format(customFrom, 'PPP') : 'From date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customFrom}
                    onSelect={setCustomFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-sm text-muted-foreground self-center">
                to
              </span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-8 min-w-40 justify-start text-left font-normal text-xs',
                      !customTo && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    <span className="truncate">
                      {customTo ? format(customTo, 'PPP') : 'To date'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={customTo}
                    onSelect={setCustomTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={customBy}
                onValueChange={(value: 'day' | 'month') => setCustomBy(value)}
              >
                <SelectTrigger className="h-8 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleCustomRangeApply}
                className="h-8 px-2"
                disabled={!customFrom || !customTo}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          )}

          {selectedOption && !isCustomRange && (
            <div className="text-xs text-muted-foreground self-center">
              {selectedOption.from} to {selectedOption.to} ({selectedOption.by})
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { DATE_RANGE_OPTIONS };
