import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, Clock, TrendingUp } from 'lucide-react';
import type { LearningStats as LearningStatsType } from '../types/dashboard.types';

interface LearningStatsSidebarProps {
  stats: LearningStatsType;
}

export const LearningStatsSidebar = ({ stats }: LearningStatsSidebarProps) => {
  const todayProgress = (stats.completed / stats.todayGoal) * 100;
  const weeklyProgress = (stats.weeklyCompleted / stats.weeklyGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Current Streak */}
      <Card className="border-2 border-orange-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Current Streak
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.currentStreak}
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            🔥 Longest: {stats.longestStreak} days
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className="border-2 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Today's Progress
              </div>
              <div className="text-xl font-bold text-blue-600">
                {stats.completed}/{stats.todayGoal}
              </div>
            </div>
          </div>
          <Progress value={todayProgress} className="h-2 mb-2" />
          <div className="text-xs text-muted-foreground">
            {stats.todayGoal - stats.completed} min remaining
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="border-2 border-green-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Weekly Progress
              </div>
              <div className="text-xl font-bold text-green-600">
                {stats.weeklyCompleted}/{stats.weeklyGoal}
              </div>
            </div>
          </div>
          <Progress value={weeklyProgress} className="h-2 mb-2" />
          <div className="text-xs text-green-600">
            {Math.round(weeklyProgress)}% complete
          </div>
        </CardContent>
      </Card>

      {/* Total Study Time */}
      <Card className="border-2 border-purple-100">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Total Study Time
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(stats.totalStudyTime / 60)}h
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Avg: {stats.averageDaily} min/day
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
