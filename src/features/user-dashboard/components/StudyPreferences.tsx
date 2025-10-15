import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Calendar, Bell, Settings } from 'lucide-react';

export interface StudyPreferences {
  dailyGoal: number; // minutes
  preferredTime: string;
  targetScore: number;
  currentScore: number;
  studyDays: string[];
  reminderEnabled: boolean;
}

interface StudyPreferencesProps {
  preferences: StudyPreferences;
  onEdit?: () => void;
}

export const StudyPreferencesCard = ({
  preferences,
  onEdit,
}: StudyPreferencesProps) => {
  const progress = (
    (preferences.currentScore / preferences.targetScore) *
    100
  ).toFixed(0);

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Study Preferences
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Daily Goal */}
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4 mr-1 text-blue-500" />
              Daily Goal
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {preferences.dailyGoal}
            </div>
            <div className="text-xs text-muted-foreground">minutes/day</div>
          </div>

          {/* Preferred Time */}
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 mr-1 text-purple-500" />
              Study Time
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {preferences.preferredTime}
            </div>
            <div className="text-xs text-muted-foreground">preferred time</div>
          </div>

          {/* Target Score */}
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Target className="h-4 w-4 mr-1 text-green-500" />
              Target Score
            </div>
            <div className="text-2xl font-bold text-green-600">
              {preferences.targetScore}
            </div>
            <div className="text-xs text-muted-foreground">
              current: {preferences.currentScore} ({progress}%)
            </div>
          </div>

          {/* Study Days */}
          <div className="flex flex-col">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Bell className="h-4 w-4 mr-1 text-orange-500" />
              Study Days
            </div>
            <div className="flex flex-wrap gap-1">
              {preferences.studyDays.map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {preferences.reminderEnabled
                ? '🔔 Reminder: On'
                : 'Reminder: Off'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
