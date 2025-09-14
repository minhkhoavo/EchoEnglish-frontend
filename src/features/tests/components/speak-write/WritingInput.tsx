import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WritingInputProps {
  answer: string;
  onAnswerChange: (value: string) => void;
  isPictureQuestion?: boolean;
  isEmailQuestion?: boolean;
  isEssayQuestion?: boolean;
  wordCount: number;
}

export const WritingInput: React.FC<WritingInputProps> = ({
  answer,
  onAnswerChange,
  isPictureQuestion = false,
  isEmailQuestion = false,
  isEssayQuestion = false,
  wordCount,
}) => {
  const getPlaceholder = () => {
    if (isPictureQuestion) {
      return 'Write a sentence based on the picture using the given words...';
    }
    if (isEmailQuestion) {
      return 'Dear [Name],\n\nThank you for your email...\n\nBest regards,\n[Your name]';
    }
    if (isEssayQuestion) {
      return 'In my opinion, ...\n\nFirstly, ...\n\nSecondly, ...\n\nIn conclusion, ...';
    }
    return 'Write your response here...';
  };

  const getLabel = () => {
    if (isPictureQuestion) return 'Write your sentence here:';
    if (isEmailQuestion) return 'Write your email response:';
    if (isEssayQuestion) return 'Write your essay:';
    return 'Write your response:';
  };

  const getWordCountGuidance = () => {
    if (isEssayQuestion) return 'Minimum 300 words recommended';
    if (isEmailQuestion) return 'Keep it concise but complete';
    if (isPictureQuestion) return 'One complete sentence';
    return '';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">{getLabel()}</label>
        {isPictureQuestion ? (
          <Input
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full"
          />
        ) : (
          <Textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder={getPlaceholder()}
            rows={isEssayQuestion ? 15 : isEmailQuestion ? 10 : 8}
            className="w-full font-mono text-sm"
          />
        )}

        {/* Word count guidance */}
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{getWordCountGuidance()}</span>
          <span>{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};
