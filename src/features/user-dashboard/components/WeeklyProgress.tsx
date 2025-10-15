import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  BookOpen,
  CheckCircle,
  Play,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import {
  useGetActiveRoadmapQuery,
  transformRoadmapData,
} from '../services/dashboardApi';

interface WeeklyProgressProps {
  className?: string;
}

export const WeeklyProgress = ({ className }: WeeklyProgressProps) => {
  const {
    data: roadmapResponse,
    isLoading,
    error,
  } = useGetActiveRoadmapQuery();
  const [selectedWeek, setSelectedWeek] = useState(1);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading weekly progress...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !roadmapResponse?.data) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">Unable to load weekly progress</p>
        </CardContent>
      </Card>
    );
  }

  const { weeklyLessons, currentWeek } = transformRoadmapData(
    roadmapResponse.data
  );
  const currentWeekData = weeklyLessons.find(
    (week) => week.weekNumber === selectedWeek
  );

  // Calculate progress percentage (mock calculation for now)
  const progressPercentage =
    selectedWeek <= currentWeek ? (selectedWeek < currentWeek ? 100 : 71) : 0;

  const getDayStatus = (dayIndex: number) => {
    if (selectedWeek < currentWeek) return 'completed';
    if (selectedWeek === currentWeek) {
      return dayIndex < 3
        ? 'completed'
        : dayIndex === 3
          ? 'current'
          : 'upcoming';
    }
    return 'upcoming';
  };

  const getDayIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-white" />;
      case 'current':
        return <Play className="h-4 w-4 text-white" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-white/30" />;
    }
  };

  const getDayColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={className}>
      {/* Week Navigation */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6" />
            <h2 className="text-xl font-bold">Learning Schedule</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            This Week
          </Button>
        </div>

        {/* Week Selector */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek === 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Week Numbers */}
          <div className="flex space-x-2">
            {weeklyLessons.slice(0, 8).map((week, index) => (
              <button
                key={week.weekNumber}
                onClick={() => setSelectedWeek(week.weekNumber)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  selectedWeek === week.weekNumber
                    ? 'bg-white text-purple-600 scale-110'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {week.weekNumber}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setSelectedWeek(Math.min(weeklyLessons.length, selectedWeek + 1))
            }
            disabled={selectedWeek === weeklyLessons.length}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Content */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-6">
          {currentWeekData ? (
            <div className="space-y-6">
              {/* Week Title and Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    Week {selectedWeek}:{' '}
                    {currentWeekData.title.replace(/^Week \d+:\s*/, '')}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {progressPercentage}%
                    </div>
                    <div className="text-sm text-gray-500">Progress</div>
                  </div>
                </div>

                <Progress value={progressPercentage} className="h-3" />

                <p className="text-gray-600 leading-relaxed">
                  {currentWeekData.summary}
                </p>
              </div>

              {/* Daily Schedule - Roadmap Style */}
              {currentWeekData.hasDetailedPlan ? (
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-gray-300"></div>

                  <div className="space-y-4">
                    {currentWeekData.dailyLessons
                      .slice(0, 6)
                      .map((lesson, index) => {
                        const status = getDayStatus(index);
                        const isToday = status === 'current';
                        const isCompleted = status === 'completed';

                        return (
                          <div
                            key={index}
                            className="relative flex items-start space-x-6"
                          >
                            {/* Timeline Node */}
                            <div className="relative z-10 flex-shrink-0">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all ${
                                  isCompleted
                                    ? 'bg-green-500 scale-110'
                                    : isToday
                                      ? 'bg-blue-500 scale-110 animate-pulse'
                                      : 'bg-gray-300'
                                }`}
                              >
                                {getDayIcon(status)}
                              </div>

                              {/* Day Label */}
                              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isCompleted
                                      ? 'bg-green-100 text-green-700'
                                      : isToday
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {weekDays[index]}
                                </span>
                              </div>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 pt-2">
                              <div
                                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                                  isToday
                                    ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                                    : isCompleted
                                      ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`font-semibold ${
                                        isCompleted
                                          ? 'text-green-700'
                                          : isToday
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                      }`}
                                    >
                                      Day {index + 1}
                                    </span>
                                    {isToday && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs animate-bounce">
                                        Today
                                      </Badge>
                                    )}
                                    {isCompleted && (
                                      <Badge className="bg-green-100 text-green-700 text-xs">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Action Button */}
                                  <div className="flex items-center space-x-2">
                                    {isCompleted && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Review
                                      </Button>
                                    )}
                                    {isToday && (
                                      <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Start Now
                                      </Button>
                                    )}
                                    {status === 'upcoming' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                        className="opacity-50"
                                      >
                                        Locked
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                <p
                                  className={`text-sm mb-3 leading-relaxed ${
                                    isCompleted
                                      ? 'text-green-700'
                                      : isToday
                                        ? 'text-blue-700'
                                        : 'text-gray-600'
                                  }`}
                                >
                                  {lesson}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3 w-3 mr-1" />
                                    30 minutes
                                  </div>

                                  {/* Progress indicator for completed/current */}
                                  {(isCompleted || isToday) && (
                                    <div className="flex items-center space-x-1">
                                      <div
                                        className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-blue-400'}`}
                                      ></div>
                                      <div
                                        className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`}
                                      ></div>
                                      <div
                                        className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`}
                                      ></div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Roadmap Footer */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-600">Current</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <span className="text-xs text-gray-600">
                            Upcoming
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Week {selectedWeek} Progress: {progressPercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-amber-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-amber-800 mb-2">
                      Coming Soon!
                    </h4>
                    <p className="text-amber-700 text-sm mb-4">
                      This week's detailed plan will be unlocked after
                      completing previous weeks.
                    </p>
                    <div className="bg-white/50 rounded-lg p-4">
                      <p className="text-sm text-amber-800 font-medium">
                        {currentWeekData.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No schedule available for this week
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
