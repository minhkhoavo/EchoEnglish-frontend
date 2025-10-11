import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  CheckCircle,
  Award,
  Star,
  TrendingUp,
} from 'lucide-react';
import type { WritingOverallResult } from '../types/writing-result.types';
import { getScoreColor } from '../utils/utils';

interface OverallScoreHeaderProps {
  result: WritingOverallResult;
}

const getProficiencyColor = (level: string): string => {
  const colors: Record<string, string> = {
    Beginner: 'text-gray-600 border-gray-300 bg-gray-50',
    Intermediate: 'text-blue-600 border-blue-300 bg-blue-50',
    Advanced: 'text-purple-600 border-purple-300 bg-purple-50',
    Expert: 'text-emerald-600 border-emerald-300 bg-emerald-50',
  };
  return colors[level] || colors.Beginner;
};

const getScoreGrade = (
  percentage: number
): { grade: string; color: string; bgColor: string } => {
  if (percentage >= 90)
    return {
      grade: 'A+',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    };
  if (percentage >= 80)
    return { grade: 'A', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (percentage >= 70)
    return { grade: 'B', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  if (percentage >= 60)
    return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-50' };
};

export const OverallScoreHeader: React.FC<OverallScoreHeaderProps> = ({
  result,
}) => {
  const overallPercentage = (result.overallScore / 200) * 100;
  const proficiencyColorClass = getProficiencyColor(result.proficiencyLevel);
  const scoreColorClass = getScoreColor(overallPercentage);
  const gradeInfo = getScoreGrade(overallPercentage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CardContent className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Main Score Display */}
          <div className="lg:col-span-1 text-center lg:text-left">
            <div className="relative inline-block">
              {/* Score Circle */}
              <div className="relative w-32 h-32 mx-auto lg:mx-0">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallPercentage / 100)}`}
                    className={scoreColorClass}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Score text in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColorClass}`}>
                    {result.overallScore}
                  </span>
                  <span className="text-sm text-gray-500">
                    /{result.maxOverallScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Grade Badge */}
            <div className="mt-4">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full ${gradeInfo.bgColor} ${gradeInfo.color} font-semibold text-lg`}
              >
                <Star className="h-5 w-5 mr-2" />
                Grade {gradeInfo.grade}
              </div>
            </div>
          </div>

          {/* Middle: Test Info */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                TOEIC Writing Test Result
              </h1>
              <p className="text-lg text-gray-600">{result.testTitle}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Completed on {formatDate(result.testDate)}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-green-500" />
                <span>Duration: {result.testDuration} minutes</span>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span>Completion: {result.completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Right: Proficiency & Stats */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Proficiency Level
              </h3>
              <Badge
                variant="outline"
                className={`${proficiencyColorClass} text-lg px-4 py-2 font-semibold`}
              >
                <Award className="h-4 w-4 mr-2" />
                {result.proficiencyLevel}
              </Badge>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Overall Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Score Range</span>
                  <span className="text-sm font-medium">
                    {overallPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={overallPercentage} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Beginner</span>
                  <span>Expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
