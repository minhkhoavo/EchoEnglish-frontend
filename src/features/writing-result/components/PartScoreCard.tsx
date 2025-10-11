import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { WritingPartResult } from '../types/writing-result.types';
import { getScoreColor } from '../utils/utils';
import { QuestionResultCard } from './QuestionResultCard';

interface PartScoreCardProps {
  part: WritingPartResult;
  showAllDetails?: boolean;
}

export const PartScoreCard: React.FC<PartScoreCardProps> = ({
  part,
  showAllDetails = false,
}) => {
  const [showQuestions, setShowQuestions] = useState(false);

  // Sync with parent showAllDetails prop
  useEffect(() => {
    setShowQuestions(showAllDetails);
  }, [showAllDetails]);
  const scorePercentage = (part.score / part.maxScore) * 100;
  const scoreColorClass = getScoreColor(scorePercentage);

  return (
    <Card className="group transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header with Part Number and Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              Part {part.partNumber}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {part.partName}
              </h3>
              <div
                className="text-sm text-gray-500 mt-1 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: `<style>ul { list-style-position: inside; }</style>${part.description}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Part Score
            </span>
            <span className={`text-2xl font-bold ${scoreColorClass}`}>
              {part.score}
              <span className="text-lg text-gray-400">/{part.maxScore}</span>
            </span>
          </div>
          <Progress value={scorePercentage} className="h-3 bg-gray-100" />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {part.questionsCount} questions
            </span>
            <span className="text-xs font-medium text-gray-600">
              {scorePercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Questions ({part.questions.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              {showQuestions ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show Details
                </>
              )}
            </Button>
          </div>

          {showQuestions && (
            <div className="space-y-4">
              {part.questions.map((question) => (
                <QuestionResultCard
                  key={question.questionId}
                  question={question}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
