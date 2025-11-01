import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import type { ScoreData } from '../types/dashboard.types';
import { useState } from 'react';

interface ScoreOverviewProps {
  scoreData: ScoreData;
}

export const ScoreOverview = ({ scoreData }: ScoreOverviewProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const roundToNearestFive = (score: number) => Math.ceil(score / 5) * 5;

  const roundedListeningScore = roundToNearestFive(scoreData.listeningScore);
  const roundedReadingScore = roundToNearestFive(scoreData.readingScore);
  const roundedOverallScore = roundedListeningScore + roundedReadingScore;

  const chartData = [
    { name: 'Current Score', value: roundedOverallScore, color: '#3B82F6' },
    {
      name: 'Remaining',
      value: scoreData.targetScore - roundedOverallScore,
      color: '#E5E7EB',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
    } = props;

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          fill="#1F2937"
          className="text-2xl font-bold"
        >
          {payload.name === 'Current Score' ? payload.value : ''}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl" style={{ color: '#1F2937' }}>
          TOEIC Score Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-64 h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center w-full">
          <div className="text-4xl font-bold mb-2" style={{ color: '#3B82F6' }}>
            {roundedOverallScore}/{scoreData.targetScore}
          </div>
          <Badge className="bg-blue-100 text-blue-800 text-sm mb-4">
            CEFR {scoreData.cefrLevel} Level
          </Badge>
          <div className="space-y-3 mt-6">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6B7280' }}>Listening</span>
              <span className="font-semibold" style={{ color: '#1F2937' }}>
                {roundedListeningScore}/495
              </span>
            </div>
            <Progress
              value={(roundedListeningScore / 495) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-sm">
              <span style={{ color: '#6B7280' }}>Reading</span>
              <span className="font-semibold" style={{ color: '#1F2937' }}>
                {roundedReadingScore}/495
              </span>
            </div>
            <Progress
              value={(roundedReadingScore / 495) * 100}
              className="h-2"
            />
          </div>
          <p className="mt-6 text-sm text-center" style={{ color: '#6B7280' }}>
            {scoreData.summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
