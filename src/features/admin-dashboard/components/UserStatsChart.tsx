import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

interface UserStatsChartProps {
  data?: Array<{
    count: number;
    date: {
      year: number;
      month: number;
      day?: number;
    };
  }>;
  isLoading?: boolean;
  dateRangeBy?: 'day' | 'month' | 'year';
}

const chartConfig = {
  users: {
    label: 'Users',
    color: '#2563eb',
  },
} satisfies ChartConfig;

const formatDate = (
  date: { year: number; month: number; day?: number },
  by: 'day' | 'month' | 'year' = 'month'
) => {
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (by === 'day' && date.day) {
    return `${monthNames[date.month - 1]} ${date.day}`;
  } else if (by === 'month') {
    return `${monthNames[date.month - 1]} ${date.year}`;
  } else {
    return `${date.year}`;
  }
};

export function UserStatsChart({
  data,
  isLoading = false,
  dateRangeBy = 'month',
}: UserStatsChartProps) {
  const chartData =
    data?.map((item) => {
      const formattedDate = formatDate(item.date, dateRangeBy);

      return {
        date: formattedDate,
        users: item.count,
        fullDate: formattedDate,
      };
    }) || [];

  // Calculate total and growth
  const totalUsers = chartData.reduce((sum, item) => sum + item.users, 0);
  const hasGrowth = chartData.length > 1;
  const growthRate = hasGrowth
    ? ((chartData[chartData.length - 1]?.users - chartData[0]?.users) /
        (chartData[0]?.users || 1)) *
      100
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Growth Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              User registration trends over time
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] flex items-center justify-center">
            <div className="animate-pulse bg-muted h-64 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Growth Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            User registration trends over time
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          {hasGrowth && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp
                className={`h-3 w-3 ${growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              />
              <span
                className={
                  growthRate >= 0 ? 'text-emerald-600' : 'text-red-600'
                }
              >
                {growthRate >= 0 ? '+' : ''}
                {growthRate.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No user data available</p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 16,
                right: 16,
                top: 16,
                bottom: 16,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => value}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <ChartTooltip
                cursor={{
                  stroke: '#2563eb',
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                }}
                content={
                  <ChartTooltipContent
                    className="bg-white/95 backdrop-blur-sm border shadow-lg"
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value, name) => [
                      <span className="font-semibold text-blue-600">
                        {value} users
                      </span>,
                      'Registered',
                    ]}
                  />
                }
              />
              <Line
                dataKey="users"
                type="monotone"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{
                  fill: '#2563eb',
                  strokeWidth: 2,
                  r: 4,
                  stroke: '#ffffff',
                }}
                activeDot={{
                  r: 6,
                  fill: '#2563eb',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
