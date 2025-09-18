import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Mic,
  Clock,
  Target,
  TrendingUp,
  Users,
  Award,
} from 'lucide-react';
import type { SpeakingResultStats, SpeakingOverallResult } from '../types';

interface TestStatsCardProps {
  stats: SpeakingResultStats;
  result: SpeakingOverallResult;
}

export const TestStatsCard: React.FC<TestStatsCardProps> = ({
  stats,
  result,
}) => {
  const completionRate = (stats.answeredQuestions / stats.totalQuestions) * 100;
  const avgTimeMinutes = Math.floor(stats.averageResponseTime / 60);
  const avgTimeSeconds = stats.averageResponseTime % 60;
  const totalRecordingMinutes = Math.floor(stats.totalRecordingTime / 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statsData = [
    {
      icon: Target,
      label: 'Questions Completed',
      value: `${stats.answeredQuestions}/${stats.totalQuestions}`,
      percentage: completionRate,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Clock,
      label: 'Avg Response Time',
      value: formatTime(stats.averageResponseTime),
      percentage: 75, // Sample percentage for good response time
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Mic,
      label: 'Total Recording',
      value: `${totalRecordingMinutes}m`,
      percentage: 85, // Sample percentage
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Award,
      label: 'Parts Mastered',
      value: `${result.parts.filter((p) => p.score / p.maxScore >= 0.8).length}/${result.parts.length}`,
      percentage:
        (result.parts.filter((p) => p.score / p.maxScore >= 0.8).length /
          result.parts.length) *
        100,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Test Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {statsData.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Progress value={stat.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Performance</span>
                    <span>{stat.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Performance Insights */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Performance Insights
          </h4>
          <div className="grid grid-cols-1 gap-4 text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-lg font-bold text-emerald-700">
                {Math.round(
                  (result.overallScore / result.maxOverallScore) * 100
                )}
                %
              </div>
              <div className="text-xs text-emerald-600">Overall Score</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-lg font-bold text-blue-700">
                {
                  result.parts.filter(
                    (p) =>
                      p.proficiencyLevel === 'Advanced' ||
                      p.proficiencyLevel === 'Expert'
                  ).length
                }
              </div>
              <div className="text-xs text-blue-600">Strong Areas</div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-lg font-bold text-amber-700">
                {
                  result.parts.filter(
                    (p) =>
                      p.proficiencyLevel === 'Beginner' ||
                      p.proficiencyLevel === 'Intermediate'
                  ).length
                }
              </div>
              <div className="text-xs text-amber-600">Growth Areas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
