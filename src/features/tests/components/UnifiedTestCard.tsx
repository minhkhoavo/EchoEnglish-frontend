import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, BookOpen, Mic, PenTool } from 'lucide-react';

interface UnifiedTest {
  _id: string;
  testTitle: string;
  type: 'listening-reading' | 'speaking' | 'writing';
  duration?: number;
  number_of_questions?: number;
  number_of_parts?: number;
}

interface UnifiedTestCardProps {
  test: UnifiedTest;
  onTestSelect?: (testId: string) => void;
}

export const UnifiedTestCard: React.FC<UnifiedTestCardProps> = ({
  test,
  onTestSelect,
}) => {
  const navigate = useNavigate();

  // Convert _id to string to handle MongoDB ObjectId properly
  const testId = typeof test._id === 'string' ? test._id : String(test._id);

  // Map test type to config
  const typeConfig = {
    'listening-reading': {
      icon: BookOpen,
      color: 'bg-blue-500',
      route: `/test-detail/${testId}`,
      description: 'Listening & Reading',
      duration: test.duration || 0,
      numberOfQuestions: test.number_of_questions || 0,
      numberOfParts: test.number_of_parts || 0,
    },
    speaking: {
      icon: Mic,
      color: 'bg-green-500',
      route: `/speaking-exam/${testId}`,
      description: 'Speaking Test',
      duration: test.duration || 0,
      numberOfQuestions: test.number_of_questions || 0,
      numberOfParts: test.number_of_parts || 0,
    },
    writing: {
      icon: PenTool,
      color: 'bg-purple-500',
      route: `/test/writing/${testId}/select`,
      description: 'Writing Test',
      duration: test.duration || 0,
      numberOfQuestions: test.number_of_questions || 0,
      numberOfParts: test.number_of_parts || 0,
    },
  };

  const config = typeConfig[test.type];
  const IconComponent = config.icon;

  const handleStartTest = () => {
    if (test.type === 'listening-reading' && onTestSelect) {
      // For listening-reading tests, use onTestSelect to show detail in ContentPage
      onTestSelect(testId);
    } else {
      // For other test types, navigate directly
      navigate(config.route);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                {config.description}
              </Badge>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {test.testTitle}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Test Info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Questions:</span>
            <span className="font-medium">{config.numberOfQuestions}</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Parts:</span>
            <span className="font-medium">{config.numberOfParts}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {formatDuration(config.duration)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartTest}
          className="w-full group-hover:shadow-md transition-all"
          size="sm"
        >
          Detail
        </Button>
      </CardContent>
    </Card>
  );
};
