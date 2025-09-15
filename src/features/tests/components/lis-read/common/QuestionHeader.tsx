import { Badge } from '@/components/ui/badge';
import React from 'react';

interface QuestionHeaderProps {
  questionNumber?: number;
  range?: [number, number];
  partName?: string;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  questionNumber,
  range,
  partName,
}) => (
  <div className="flex items-center gap-4 mb-4">
    {partName && (
      <Badge variant="outline" className="text-lg px-4 py-2">
        {partName}
      </Badge>
    )}
    {range ? (
      <span className="text-muted-foreground">
        Questions {range[0]} - {range[1]}
      </span>
    ) : questionNumber !== undefined ? (
      <Badge variant="secondary" className="text-lg px-3 py-1">
        Question {questionNumber}
      </Badge>
    ) : null}
  </div>
);
