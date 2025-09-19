import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  timeOptions,
  getTotalQuestions,
} from '@/features/tests/constants/testConstants';

interface CustomModeControlsProps {
  isCustomMode: boolean;
  selectedParts: string[];
  customTime: string;
  onCustomModeChange: (checked: boolean) => void;
  onTimeChange: (time: string) => void;
  onStartTest: () => void;
}

export const CustomModeControls: React.FC<CustomModeControlsProps> = ({
  isCustomMode,
  selectedParts,
  customTime,
  onCustomModeChange,
  onTimeChange,
  onStartTest,
}) => {
  const totalQuestions = getTotalQuestions(selectedParts);

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="flex items-center gap-3 mb-4">
        <Checkbox
          id="custom-mode"
          checked={isCustomMode}
          onCheckedChange={onCustomModeChange}
        />
        <label htmlFor="custom-mode" className="font-medium cursor-pointer">
          Select parts
        </label>
      </div>

      {/* Time Selection for Custom Mode */}
      {isCustomMode && (
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium">Time:</span>
          <Select value={customTime} onValueChange={onTimeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Start Button */}
      <Button
        onClick={onStartTest}
        size="lg"
        className="w-full md:w-auto px-8 py-3 text-lg font-semibold"
        disabled={isCustomMode && selectedParts.length === 0}
      >
        START
      </Button>
    </div>
  );
};
