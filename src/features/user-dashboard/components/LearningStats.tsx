import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, Clock, TrendingUp } from 'lucide-react';
import type { LearningStats as LearningStatsType } from '../types/dashboard.types';

interface LearningStatsProps {
  stats: LearningStatsType;
}

export const LearningStats = ({ stats }: LearningStatsProps) => {
  const todayProgress = (stats.completed / stats.todayGoal) * 100;
  const weeklyProgress = (stats.weeklyCompleted / stats.weeklyGoal) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Current Streak
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.currentStreak}
                </div>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-700">
              🔥 {stats.currentStreak} Days
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Longest streak: {stats.longestStreak} days. Keep it up!
          </p>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Today's Progress
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.completed}/{stats.todayGoal}
                </div>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              {Math.round(todayProgress)}%
            </Badge>
          </div>
          <Progress value={todayProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {stats.todayGoal - stats.completed} minutes remaining
          </p>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Weekly Progress
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.weeklyCompleted}/{stats.weeklyGoal}
                </div>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700">
              {Math.round(weeklyProgress)}%
            </Badge>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
          <p className="text-sm text-green-600 mt-2">
            🎯{' '}
            {stats.weeklyCompleted > stats.weeklyGoal * 0.7
              ? "Outstanding! You're ahead of schedule!"
              : 'Keep going!'}
          </p>
        </CardContent>
      </Card>

      {/* Total Study Time */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Study Time
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor(stats.totalStudyTime / 60)}h
                </div>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              Avg: {stats.averageDaily}min/day
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            You've invested {stats.totalStudyTime} minutes in your learning
            journey
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
