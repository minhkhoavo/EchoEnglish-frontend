import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"; // prettier-ignore
import { Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"; // prettier-ignore
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"; // prettier-ignore

const chartConfig = {
  score: {
    label: 'Pronunciation Score',
    color: 'hsl(var(--chart-1))',
  },
  correct: {
    label: 'Correct',
    color: '#ef4444',
  },
  remaining: {
    label: 'Remaining',
    color: '#e5e7eb',
  },
} satisfies ChartConfig;

interface ScoreChartProps {
  percentage: number;
  level: string;
}

const ScoreChart = ({ percentage, level }: ScoreChartProps) => {
  const scoreData = [
    {
      name: 'Correct',
      value: Math.max(0, Math.min(100, percentage)),
      fill: '#ef4444',
    },
    {
      name: 'Remaining',
      value: Math.max(0, 100 - Math.max(0, Math.min(100, percentage))),
      fill: '#e5e7eb',
    },
  ];
  return (
    <Card className="w-[150px] h-[150px] p-0 shadow-sm border-0">
      <CardContent className="p-0 flex items-center justify-center relative w-full h-full">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                strokeWidth={0}
              >
                {scoreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{percentage}%</p>
            <p className="text-xs font-semibold text-gray-800">{level}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface ScoreSummaryProps {
  percentage?: number;
  level?: string;
  title?: string;
  description?: string;
}

const ScoreSummary = ({
  percentage = 0,
  level = 'N/A',
  title = 'Pronunciation Score',
  description,
}: ScoreSummaryProps) => (
  <div className="flex items-center space-x-6 p-4 bg-white">
    <div className="flex-shrink-0">
      <ScoreChart percentage={Math.round(percentage)} level={level} />
    </div>
    <div className="flex-grow">
      <div className="flex items-center space-x-2 mb-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">{title}</h2>
        <Info className="w-4 h-4 text-gray-500" />
      </div>
      <div className="text-gray-600 space-y-1 text-sm">
        <p>
          {description || (
            <>
              Your pronunciation level is <strong>{level}.</strong> Let's make
              that better!
            </>
          )}
        </p>
        {!description && (
          <p>
            Time to work on your Top Errors! Follow our 'Suggestions for
            Improvement' to get to the next level.
          </p>
        )}
      </div>
    </div>
  </div>
);

export default ScoreSummary;
