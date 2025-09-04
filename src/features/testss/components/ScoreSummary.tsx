import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Info } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

// Data cho biểu đồ tròn
const scoreData = [
  { name: "Correct", value: 38, fill: "#ef4444" },
  { name: "Remaining", value: 62, fill: "#e5e7eb" },
];

const chartConfig = {
  score: {
    label: "Pronunciation Score",
    color: "hsl(var(--chart-1))",
  },
  correct: {
    label: "Correct",
    color: "#ef4444",
  },
  remaining: {
    label: "Remaining",
    color: "#e5e7eb",
  },
} satisfies ChartConfig;

interface ScoreChartProps {
  percentage: number;
  level: string;
}

const ScoreChart = ({ percentage, level }: ScoreChartProps) => (
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
      {/* Nội dung ở giữa */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{percentage}%</p>
          <p className="text-xs font-semibold text-gray-800">{level}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ScoreSummary = () => (
    <div className="flex items-center space-x-6 p-4 bg-white">
        <div className="flex-shrink-0">
            <ScoreChart percentage={38} level="Beginner" />
        </div>
        <div className="flex-grow">
            <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-lg font-bold text-gray-800">Pronunciation Score</h2>
                <Info className="w-4 h-4 text-gray-500" />
            </div>
            <div className="text-gray-600 space-y-1 text-sm">
                <p>Your pronunciation level is <strong>Beginner.</strong> Let's make that better!</p>
                <p>Time to work on your Top Errors! Follow our 'Suggestions for Improvement' to get to the next level.</p>
            </div>
        </div>
    </div>
);

export default ScoreSummary;
