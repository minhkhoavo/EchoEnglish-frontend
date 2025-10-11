import { Calendar, Target, History } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/core/store/store';
import { useNavigate } from 'react-router-dom';

import { useGetUserStatsQuery } from '../services/testResultAPI';
import { daysToDate } from '@/features/tests/utils/date';

export const UserSidebar = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { data: userStatsLR, isLoading } = useGetUserStatsQuery();
  const navigate = useNavigate();

  // User data
  const userData = {
    username: user?.fullName || 'John Doe',
    avatar:
      user?.image ||
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    examDate: '05/09/2027',
    daysToExam: daysToDate('20/09/2027'),
    targetScore: 740,
  };

  return (
    <div className="w-80 space-y-4">
      {/* User Profile Card */}
      <Card className="bg-card border-border">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userData.avatar} alt="User Avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userData.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-medium text-card-foreground text-sm">
                {userData.username}
              </h3>
              <Badge variant="secondary" className="mt-1">
                TOEIC Learner
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Exam Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Exam Date:</span>
              </div>
              <span className="text-sm text-card-foreground">
                {userData.examDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Days to Exam:</span>
              </div>
              <span className="text-sm text-card-foreground">
                {userData.daysToExam} days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Target Score:</span>
              </div>
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground"
              >
                {userData.targetScore}
              </Badge>
            </div>
          </div>

          {/* History Button */}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => navigate('/me/tests')}
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h4 className="font-semibold text-card-foreground">Quick Stats</h4>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? '...' : userStatsLR?.listeningReadingTests || 0}
              </div>
              <div className="text-xs text-blue-700 font-medium">
                Tests Taken
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : userStatsLR?.highestScore || 0}
              </div>
              <div className="text-xs text-green-700 font-medium">
                Highest Score
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {isLoading ? '...' : 0}
              </div>
              <div className="text-xs text-purple-700 font-medium">
                Speaking Tests
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? '...' : 0}
              </div>
              <div className="text-xs text-orange-700 font-medium">
                Writing Tests
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
