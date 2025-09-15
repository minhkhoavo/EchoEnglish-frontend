import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { TestPart } from '../constants/testConstants';

interface TestPartListProps {
  parts: TestPart[];
  selectedParts: string[];
  isCustomMode: boolean;
  onPartToggle: (partId: string) => void;
  colorClass: string;
  borderClass: string;
}

export const TestPartList: React.FC<TestPartListProps> = ({
  parts,
  selectedParts,
  isCustomMode,
  onPartToggle,
  colorClass,
  borderClass,
}) => (
  <div className="space-y-2">
    {parts.map((part) => (
      <div
        key={part.id}
        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
          selectedParts.includes(part.id)
            ? `${colorClass}/5 ${borderClass}`
            : 'hover:bg-part-hover'
        }`}
        onClick={() => isCustomMode && onPartToggle(part.id)}
      >
        <div className="flex items-center gap-3">
          {isCustomMode && (
            <Checkbox
              checked={selectedParts.includes(part.id)}
              onCheckedChange={() => onPartToggle(part.id)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <span className="font-medium">{part.name}</span>
        </div>
        <span
          className={`text-sm px-2 py-1 rounded ${
            part.type === 'listening'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {part.questions} QUESTIONS
        </span>
      </div>
    ))}
  </div>
);
