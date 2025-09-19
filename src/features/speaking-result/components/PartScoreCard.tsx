import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Award,
  Target,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from 'lucide-react';
import type { SpeakingPartResult } from '../types/speaking-result.types';
import {
  getProficiencyColor,
  getScoreColor,
  getPartIcon,
} from '../utils/utils';
import { QuestionResultCard } from './QuestionResultCard';

interface PartScoreCardProps {
  part: SpeakingPartResult;
  onViewDetails?: () => void;
}

export const PartScoreCard: React.FC<PartScoreCardProps> = ({
  part,
  onViewDetails,
}) => {
  const [showQuestions, setShowQuestions] = useState(true); // Auto-show questions
  const scorePercentage = (part.score / part.maxScore) * 100;
  const proficiencyColorClass = getProficiencyColor(part.proficiencyLevel);
  const scoreColorClass = getScoreColor(part.score, part.maxScore);

  return (
    <Card className="group transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Header with Part Number and Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {part.partNumber}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {part.partName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{part.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
              className="opacity-70 hover:opacity-100"
            >
              {showQuestions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
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

        {/* Proficiency Level */}
        <div className="mb-4">
          <Badge
            variant="outline"
            className={`${proficiencyColorClass} font-medium px-3 py-1`}
          >
            <Award className="h-3 w-3 mr-1" />
            {part.proficiencyLevel}
          </Badge>
        </div>

        {/* Questions List - Always show */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Questions ({part.questions.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQuestions(!showQuestions)}
              className="opacity-70 hover:opacity-100"
            >
              {showQuestions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {showQuestions && (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
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
