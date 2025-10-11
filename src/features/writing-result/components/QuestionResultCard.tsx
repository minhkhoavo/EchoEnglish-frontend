import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, TrendingUp, Target, Type } from 'lucide-react';
import type { WritingQuestionResult } from '../types/writing-result.types';
import { getScoreColor } from '../utils/utils';

interface QuestionResultCardProps {
  question: WritingQuestionResult;
}

export const QuestionResultCard: React.FC<QuestionResultCardProps> = ({
  question,
}) => {
  const scorePercentage = (question.score / question.maxScore) * 100;
  const scoreColorClass = getScoreColor(scorePercentage);

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-sm">
              <span className="text-sm font-bold">
                Question {question.questionNumber}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColorClass}`}>
                  {question.score}
                </span>
                <span className="text-sm text-gray-500">
                  /{question.maxScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* Question Text/Title */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {question.title || 'Question'}
            </h4>
            <div
              className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.questionText }}
            />
          </div>

          {/* Image if available */}
          {question.imageUrl && (
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                <Image className="h-3 w-3" />
                Image
              </h5>
              <img
                src={question.imageUrl}
                alt="Question image"
                className="w-full max-w-md h-auto rounded border"
              />
            </div>
          )}

          {/* User Answer */}
          <div>
            <h5 className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <Type className="h-3 w-3" />
              Your Answer ({question.wordCount} words)
            </h5>
            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="whitespace-pre-wrap">
                {typeof question.userAnswer === 'string'
                  ? question.userAnswer
                  : JSON.stringify(question.userAnswer, null, 2)}
              </p>
            </div>
          </div>

          {/* Upgraded Text - Only show if exists */}
          {(question.upgradedText || question.upgradeSummary) && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-300">
              <h5 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <span className="text-lg">✨</span>
                AI Improvements
              </h5>

              {/* Upgrade Summary */}
              {question.upgradeSummary && (
                <div className="mb-3 p-3 bg-emerald-100 rounded-md border border-emerald-200">
                  <p className="text-sm text-emerald-800 font-medium">
                    💡 {question.upgradeSummary}
                  </p>
                </div>
              )}

              {/* Upgraded Text with HTML highlighting */}
              {question.upgradedText && (
                <div>
                  <h6 className="text-xs font-medium text-emerald-700 mb-2 uppercase tracking-wide">
                    Improved Version
                  </h6>
                  <div className="text-sm text-gray-800 leading-relaxed bg-white p-3 rounded border border-emerald-200">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: question.upgradedText.replace(
                          /<mark>(.*?)<\/mark>/g,
                          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                        ),
                      }}
                    />
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-200">
                    <p className="text-xs text-emerald-700 italic">
                      � Yellow highlights show the specific changes made to
                      improve your writing.
                    </p>
                  </div>
                </div>
              )}
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
      </CardContent>
    </Card>
  );
};
