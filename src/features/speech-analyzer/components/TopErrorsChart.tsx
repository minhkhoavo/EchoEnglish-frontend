import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"; // prettier-ignore
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // prettier-ignore
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"; // prettier-ignore

const chartData = [
  { sound: '/s/', errorRate: 40 },
  { sound: '/l/', errorRate: 50 },
  { sound: '/au/', errorRate: 80 },
  { sound: '/v/', errorRate: 50 },
  { sound: '/n/', errorRate: 48 },
];

const chartConfig = {
  errorRate: {
    label: 'Error Rate',
  },
} satisfies ChartConfig;

const TopErrorsChart = () => {
  return (
    <Card className="w-full max-w-2xl shadow-none border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gray-800">
          Top 5 Most Common Pronunciation Errors
        </CardTitle>
        <CardDescription className="text-xs">
          Percentage of errors for each sound
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                className="text-xs font-bold fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <YAxis
                type="category"
                dataKey="sound"
                className="text-xs font-bold fill-muted-foreground"
                axisLine={false}
                tickLine={false}
                width={40}
                interval={0}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="errorRate"
                radius={[0, 4, 4, 0]}
                barSize={16}
                fill="url(#barGradient)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TopErrorsChart;
