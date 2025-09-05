import React from 'react';
import { Clock, Users, BookOpen, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TOEICTest } from '@/features/test/types/test.types';

interface TestCardProps {
  test: TOEICTest;
}

export const TestCard = ({ test }: TestCardProps) => {
  // Mock additional data since API only provides testId and testTitle
  const mockData = {
    participants: Math.floor(Math.random() * 5000000) + 100000,
    duration: 120,
    parts: 7,
    questions: 200,
    averageScore: Math.floor(Math.random() * 300) + 450, // 450-750 điểm
    completionRate: Math.floor(Math.random() * 30) + 70, // 70-100%
    imageUrl:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop&crop=center',
  };

  return (
    <Card className="group hover:shadow-xl bg-card border-border rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2">
      {/* Test Image */}
      <div className="relative overflow-hidden h-40">
        <img
          src={mockData.imageUrl}
          alt={test.testTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-xs px-3 py-1 shadow-lg">
            TOEIC
          </Badge>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              <span>{mockData.duration} minutes</span>
            </div>
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              <Users className="h-3 w-3" />
              <span>{(mockData.participants / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {test.testTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Test Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <BookOpen className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {mockData.parts}
              </div>
              <div className="text-xs text-muted-foreground">Parts</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
            <Eye className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {mockData.questions}
              </div>
              <div className="text-xs text-muted-foreground">Questions</div>
            </div>
          </div>
        </div>

        {/* Compact stats in single row */}
        <div className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2">
          <div className="text-center">
            <div className="font-semibold text-foreground">
              {mockData.averageScore}
            </div>
            <div className="text-xs text-muted-foreground">Avg. Score</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {mockData.completionRate}%
            </div>
            <div className="text-xs text-muted-foreground">Completion</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              #{test.testId}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          onClick={() => {
            console.log(`View test details: ${test.testId}`);
          }}
        >
          Detail
        </Button>
      </CardFooter>
    </Card>
  );
};
