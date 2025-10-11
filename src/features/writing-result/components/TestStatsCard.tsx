import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Type, Target, Award, TrendingUp } from 'lucide-react';
import type {
  WritingResultStats,
  WritingOverallResult,
} from '../types/writing-result.types';
import type { WritingPartResult } from '../types/writing-result.types';

interface TestStatsCardProps {
  stats: WritingResultStats;
  result: WritingOverallResult;
}

export const TestStatsCard: React.FC<TestStatsCardProps> = ({
  stats,
  result,
}) => {
  const completionRate = (stats.answeredQuestions / stats.totalQuestions) * 100;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Test Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Stats - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Questions Completed */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Questions Completed
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.answeredQuestions}/{stats.totalQuestions}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completionRate.toFixed(0)}% Complete
            </div>
          </div>

          {/* Total Word Count */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Type className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Total Words
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalWordCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalWordCount >= 500 ? 'Excellent!' : 'Good effort'}
            </div>
          </div>

          {/* Parts Mastered */}
          <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">
              Parts Mastered
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {
                result.parts.filter(
                  (p: WritingPartResult) => p.score / p.maxScore >= 0.8
                ).length
              }
              /{result.parts.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">≥80% Score</div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Performance Overview
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-xl font-bold text-emerald-700">
                {((result.overallScore / result.maxOverallScore) * 100).toFixed(
                  1
                )}
                %
              </div>
              <div className="text-xs text-emerald-600 mt-1">Overall Score</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-xl font-bold text-blue-700">
                {
                  result.parts.filter(
                    (p) =>
                      p.proficiencyLevel === 'Advanced' ||
                      p.proficiencyLevel === 'Expert'
                  ).length
                }
              </div>
              <div className="text-xs text-blue-600 mt-1">Strong Areas</div>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-xl font-bold text-purple-700">
                {
                  result.parts.filter(
                    (p) =>
                      p.proficiencyLevel === 'Beginner' ||
                      p.proficiencyLevel === 'Intermediate'
                  ).length
                }
              </div>
              <div className="text-xs text-purple-600 mt-1">Growth Areas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
