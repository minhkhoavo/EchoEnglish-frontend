import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Brain,
  Zap,
  Trophy,
  Rocket,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useGetActiveRoadmapQuery,
  transformRoadmapData,
} from '../services/dashboardApi';

interface LearningJourneyProps {
  className?: string;
}

const phaseIcons = {
  1: BookOpen,
  2: Brain,
  3: Zap,
  4: Trophy,
};

export const LearningJourney = ({ className }: LearningJourneyProps) => {
  const {
    data: roadmapResponse,
    isLoading,
    error,
  } = useGetActiveRoadmapQuery();

  if (isLoading) {
    return (
      <Card className={`mb-8 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your learning journey...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !roadmapResponse?.data) {
    return (
      <Card className={`mb-8 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">Unable to load your learning journey</p>
        </CardContent>
      </Card>
    );
  }

  const { learningPhases, currentScore, targetScore, overallProgress } =
    transformRoadmapData(roadmapResponse.data);

  return (
    <Card
      className="mb-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center text-white text-2xl">
          <Rocket className="h-7 w-7 mr-3" />
          Your Learning Journey to {targetScore}+
        </CardTitle>
        <p className="text-white/90">
          A visual roadmap of your transformation from 650 → {targetScore}+
          TOEIC
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Journey Path Line */}
          <div
            className="absolute top-24 left-8 right-8 h-1 bg-white/30"
            style={{ zIndex: 0 }}
          ></div>

          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 relative"
            style={{ zIndex: 1 }}
          >
            {learningPhases.map((phase) => {
              const Icon = phaseIcons[phase.phase as keyof typeof phaseIcons];
              const isCompleted = phase.status === 'completed';
              const isInProgress = phase.status === 'in-progress';

              return (
                <div key={phase.phase} className="relative">
                  {/* Phase Card */}
                  <Card
                    className="bg-white hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                    style={{
                      borderWidth: isInProgress ? '3px' : '1px',
                      borderColor: isInProgress ? phase.color : '#E5E7EB',
                    }}
                  >
                    {/* Status Badge */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {isInProgress && (
                      <Badge className="absolute top-3 right-3 bg-blue-500 text-white">
                        In Progress
                      </Badge>
                    )}

                    {/* Phase Icon */}
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mt-6 shadow-lg"
                      style={{ backgroundColor: phase.bgColor }}
                    >
                      <Icon
                        className="h-8 w-8"
                        style={{ color: phase.color }}
                      />
                    </div>

                    <CardContent className="pt-4 pb-6">
                      {/* Week Info */}
                      <div
                        className="text-xs font-semibold text-center mb-2"
                        style={{ color: phase.color }}
                      >
                        {phase.weekRange}
                      </div>

                      {/* Phase Title */}
                      <h3
                        className="text-lg font-bold text-center mb-2"
                        style={{ color: '#1F2937' }}
                      >
                        {phase.title}
                      </h3>

                      {/* Target Score */}
                      <div className="text-center mb-3">
                        <div
                          className="text-2xl font-bold"
                          style={{ color: phase.color }}
                        >
                          {phase.targetScore}
                        </div>
                        <div className="text-xs" style={{ color: '#6B7280' }}>
                          Target Score
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className="text-sm text-center mb-4"
                        style={{ color: '#6B7280' }}
                      >
                        {phase.description}
                      </p>

                      {/* Key Focus Areas */}
                      <div className="space-y-2">
                        {phase.keyFocusAreas.map(
                          (focusArea: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-start text-xs"
                              style={{ color: '#4B5563' }}
                            >
                              <CheckCircle
                                className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0"
                                style={{
                                  color: isCompleted ? '#10B981' : '#9CA3AF',
                                }}
                              />
                              <span>{focusArea}</span>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connecting Line - Only between phases */}
                  {phase.phase < 4 && (
                    <div
                      className="hidden md:block absolute top-24 -right-3 w-6 h-1"
                      style={{
                        backgroundColor: isCompleted ? phase.color : '#E5E7EB',
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Progress Bar */}
          <Card className="mt-8 bg-white/90">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div
                    className="text-lg font-bold"
                    style={{ color: '#1F2937' }}
                  >
                    Overall Journey Progress
                  </div>
                  <div className="text-sm" style={{ color: '#6B7280' }}>
                    You're on your way to excellence!
                  </div>
                </div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: '#3B82F6' }}
                >
                  {Math.round(overallProgress)}%
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div
                className="flex justify-between mt-2 text-sm"
                style={{ color: '#6B7280' }}
              >
                <span>Start: {currentScore}</span>
                <span>
                  Current:{' '}
                  {Math.round(
                    currentScore +
                      (overallProgress / 100) * (targetScore - currentScore)
                  )}
                </span>
                <span>Goal: {targetScore}+</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
