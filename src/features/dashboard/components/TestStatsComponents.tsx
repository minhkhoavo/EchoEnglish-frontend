import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

// Test Stats Chart Component
interface TestStatsChartProps {
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

const testChartConfig = {
  tests: {
    label: 'Tests',
    color: '#16a34a', // green-600 - professional green
  },
} satisfies ChartConfig;

export function TestStatsChart({
  data,
  isLoading = false,
  dateRangeBy = 'month',
}: TestStatsChartProps) {
  const chartData =
    data?.map((item) => {
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

      let formattedDate: string;
      if (dateRangeBy === 'day' && item.date.day) {
        formattedDate = `${monthNames[item.date.month - 1]} ${item.date.day}`;
      } else if (dateRangeBy === 'month') {
        formattedDate = `${monthNames[item.date.month - 1]} ${item.date.year}`;
      } else {
        formattedDate = `${item.date.year}`;
      }

      return {
        date: formattedDate,
        tests: item.count,
        fullDate: formattedDate,
      };
    }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Stats Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-pulse bg-muted h-48 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Stats Chart</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No test data available
          </div>
        ) : (
          <ChartContainer config={testChartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="tests"
                fill="var(--color-tests)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

// Average Score Table Component
interface AvgScoreTableProps {
  data?: Array<{
    _id: string;
    avgScore: number;
    count: number;
  }>;
  isLoading?: boolean;
}

export function AvgScoreTable({ data, isLoading = false }: AvgScoreTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AvgScore Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-muted h-12 w-full rounded-md"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AvgScore Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Type</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    {item._id.replace('-', ' ').toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.avgScore >= 3
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                          : 'bg-orange-50 text-orange-700 border-orange-200 font-medium'
                      }
                    >
                      {item.avgScore.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.count}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No average score data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Top Users Component
interface TopUsersProps {
  data?: Array<{
    highestScore: number;
    totalTests: number;
    userId: string;
    fullName: string;
    email: string;
    address: string;
    image: string;
  }>;
  isLoading?: boolean;
}

export function TopUsers({ data, isLoading = false }: TopUsersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="animate-pulse bg-muted h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="animate-pulse bg-muted h-4 w-3/4 rounded" />
                  <div className="animate-pulse bg-muted h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.slice(0, 10).map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center justify-between space-x-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} alt={user.fullName} />
                    <AvatarFallback>
                      {user.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Score: {user.highestScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.totalTests} tests
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No top users data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
