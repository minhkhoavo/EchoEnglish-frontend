import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Lightbulb, FileText } from 'lucide-react';

interface HelperButtonsProps {
  hasIdea?: boolean;
  hasSampleAnswer?: boolean;
  hasSuggestions?: boolean;
  showIdea: boolean;
  showSampleAnswer: boolean;
  showSuggestions: boolean;
  onToggleIdea: () => void;
  onToggleSampleAnswer: () => void;
  onToggleSuggestions: () => void;
}

export const HelperButtons: React.FC<HelperButtonsProps> = ({
  hasIdea,
  hasSampleAnswer,
  hasSuggestions,
  showIdea,
  showSampleAnswer,
  showSuggestions,
  onToggleIdea,
  onToggleSampleAnswer,
  onToggleSuggestions,
}) => {
  return (
    <div className="flex gap-2">
      {hasIdea && (
        <Button variant="outline" size="sm" onClick={onToggleIdea}>
          <Lightbulb className="h-4 w-4 mr-2" />
          {showIdea ? 'Hide' : 'Show'} Ideas
        </Button>
      )}

      {hasSuggestions && (
        <Button variant="outline" size="sm" onClick={onToggleSuggestions}>
          <FileText className="h-4 w-4 mr-2" />
          {showSuggestions ? 'Hide' : 'Show'} Structure Guide
        </Button>
      )}

      {hasSampleAnswer && (
        <Button variant="outline" size="sm" onClick={onToggleSampleAnswer}>
          <Eye className="h-4 w-4 mr-2" />
          {showSampleAnswer ? 'Hide' : 'Show'} Sample Answer
        </Button>
      )}
    </div>
  );
};
