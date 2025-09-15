import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Clock, Target } from 'lucide-react';

interface TestResult {
  id: string;
  date: string;
  testType: string;
  score: string;
  duration: string;
}

const testResults: TestResult[] = [
  {
    id: '1',
    date: '12/09/2025',
    testType: 'Full test',
    score: '0/200',
    duration: '0:00:21',
  },
  {
    id: '2',
    date: '11/09/2025',
    testType: 'Luyện tập Part 5',
    score: '0/30',
    duration: '0:00:32',
  },
];

export const TestHistory = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Your Test Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                  Result
                </th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration
                  </div>
                </th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result) => (
                <tr
                  key={result.id}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="py-4 px-2">
                    <div>
                      <div className="font-medium">{result.date}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.testType}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-warning/10 text-warning">
                      {result.score}
                    </span>
                  </td>
                  <td className="py-4 px-2 font-mono text-sm">
                    {result.duration}
                  </td>
                  <td className="py-4 px-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {testResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No test results yet</p>
            <p className="text-sm">Start a test to see your results here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
