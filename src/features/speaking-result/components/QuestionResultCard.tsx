import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  Image,
  BarChart3,
  TrendingUp,
  Target,
} from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import type { SpeakingQuestionResult } from '../types';
import { getProficiencyColor, getScoreColor } from '../data/mockData';

interface QuestionResultCardProps {
  question: SpeakingQuestionResult;
  onAnalyzeInDepth?: (questionId: number) => void;
}

export const QuestionResultCard: React.FC<QuestionResultCardProps> = ({
  question,
  onAnalyzeInDepth,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const scorePercentage = (question.score / question.maxScore) * 100;
  const proficiencyColorClass = getProficiencyColor(question.proficiencyLevel);
  const scoreColorClass = getScoreColor(question.score, question.maxScore);

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex items-center justify-center">
              Q{question.questionNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColorClass}`}>
                  {question.score}
                </span>
                <span className="text-sm text-gray-500">
                  /{question.maxScore}
                </span>
                <Badge
                  variant="outline"
                  className={`${proficiencyColorClass} text-xs px-2 py-0.5`}
                >
                  {question.proficiencyLevel}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {scorePercentage.toFixed(0)}% accuracy
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAnalyzeInDepth && (
              <Button
                onClick={() => onAnalyzeInDepth(question.questionId)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
              className="p-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Feedback */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {question.strengths.length > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-xs text-emerald-700 truncate">
                {question.strengths[0]}
              </span>
            </div>
          )}
          {question.improvements.length > 0 && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-amber-600" />
              <span className="text-xs text-amber-700 truncate">
                {question.improvements[0]}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Question Text/Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {question.title || 'Question'}
              </h4>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {question.questionText}
              </div>
            </div>

            {/* Time Information */}
            {(question.time_to_think || question.limit_time) && (
              <div className="grid grid-cols-2 gap-4">
                {question.time_to_think && (
                  <div className="text-center p-2 bg-blue-50 rounded border">
                    <div className="text-lg font-bold text-blue-600">
                      {question.time_to_think}s
                    </div>
                    <div className="text-xs text-blue-600">
                      Preparation Time
                    </div>
                  </div>
                )}
                {question.limit_time && (
                  <div className="text-center p-2 bg-green-50 rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {question.limit_time}s
                    </div>
                    <div className="text-xs text-green-600">Response Time</div>
                  </div>
                )}
              </div>
            )}

            {/* Media Content */}
            <div className="grid grid-cols-1 gap-4">
              {(question.imageUrl || question.image) && (
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Image
                  </h5>
                  <img
                    src={question.imageUrl || question.image}
                    alt="Question image"
                    className="w-full h-24 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* User Response */}
            {question.userResponseUrl && (
              <div>
                <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  Your Response
                </h5>
                <AudioPlayer
                  audioUrl={question.userResponseUrl}
                  className="w-full"
                />
              </div>
            )}

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {question.strengths.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-emerald-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Strengths
                  </h5>
                  <ul className="space-y-1">
                    {question.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded"
                      >
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {question.improvements.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-amber-700 mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Areas to Improve
                  </h5>
                  <ul className="space-y-1">
                    {question.improvements.map((improvement, index) => (
                      <li
                        key={index}
                        className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"
                      >
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AI Feedback */}
            {question.feedback.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  🤖 AI Feedback
                </h5>
                <ul className="space-y-1">
                  {question.feedback.map((feedback, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded"
                    >
                      {feedback}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
