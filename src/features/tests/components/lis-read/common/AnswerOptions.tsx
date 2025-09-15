import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Option {
  label: string;
  text?: string;
}

interface AnswerOptionsProps {
  options: Option[];
  userAnswer?: string;
  correctAnswer?: string;
  showCorrectAnswers?: boolean;
  onSelect?: (label: string) => void;
  listening?: boolean;
}

export const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  userAnswer,
  correctAnswer,
  showCorrectAnswers = false,
  onSelect,
  listening = false,
}) => (
  <div className="space-y-3">
    {options.map((option) => {
      const isSelected = userAnswer === option.label;
      const isCorrect = option.label === correctAnswer;
      return (
        <div
          key={option.label}
          className={`p-3 rounded-lg border-2 transition-colors ${
            showCorrectAnswers && isCorrect
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : showCorrectAnswers && isSelected && !isCorrect
                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                : isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
          }`}
          onClick={() => onSelect && onSelect(option.label)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                showCorrectAnswers && isCorrect
                  ? 'border-green-500 bg-green-500 text-white'
                  : showCorrectAnswers && isSelected && !isCorrect
                    ? 'border-red-500 bg-red-500 text-white'
                    : isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-400 hover:border-blue-500'
              }`}
            >
              {option.label}
            </div>
            {listening ? (
              <span className="text-sm text-muted-foreground">
                (Listening options - no text displayed)
              </span>
            ) : (
              <span className="text-sm flex-1">{option.text}</span>
            )}
            {showCorrectAnswers && isCorrect && (
              <Badge
                variant="secondary"
                className="ml-auto bg-green-500 text-white"
              >
                Correct answer
              </Badge>
            )}
            {showCorrectAnswers && isSelected && !isCorrect && (
              <Badge variant="destructive" className="ml-auto">
                Your choice
              </Badge>
            )}
          </div>
        </div>
      );
    })}
  </div>
);
