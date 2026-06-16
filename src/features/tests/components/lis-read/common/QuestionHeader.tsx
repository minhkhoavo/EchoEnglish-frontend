import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import React from 'react';

interface QuestionHeaderProps {
  questionNumber?: number;
  range?: [number, number];
  partName?: string;
  onAskAI?: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  questionNumber,
  range,
  partName,
  onAskAI,
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
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-lg px-3 py-1">
          Question {questionNumber}
        </Badge>
        {onAskAI && (
          <button
            onClick={onAskAI}
            title="Ask AI about this question"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 hover:bg-violet-200 active:bg-violet-300 transition-colors border border-violet-200 cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            Ask AI
          </button>
        )}
      </div>
    ) : null}
  </div>
);
