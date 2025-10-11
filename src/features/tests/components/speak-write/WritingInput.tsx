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
      {isEssayQuestion ? (
        // Essay mode: Single textarea
        <div className="space-y-4">
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              📝 Opinion Essay
            </p>
            <p className="text-xs text-blue-700">
              Write a well-structured essay with introduction, body paragraphs,
              and conclusion. Aim for 300+ words total.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">
                Your Essay:
              </label>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Write your opinion essay here. Include:&#10;&#10;• Introduction - State your opinion clearly&#10;• Body Paragraphs - Support your opinion with reasons and examples&#10;• Conclusion - Summarize your main points"
              rows={20}
              className="w-full text-sm   leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Word count guidance */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{getWordCountGuidance()}</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      ) : (
        // Non-essay mode: single input
        <div>
          <label className="block text-sm font-medium mb-2">{getLabel()}</label>
          {isPictureQuestion ? (
            <Input
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full"
              spellCheck={false}
            />
          ) : (
            <Textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={getPlaceholder()}
              rows={isEmailQuestion ? 10 : 8}
              className="w-full text-sm"
              spellCheck={false}
            />
          )}

          {/* Word count guidance */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{getWordCountGuidance()}</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      )}
    </div>
  );
};
