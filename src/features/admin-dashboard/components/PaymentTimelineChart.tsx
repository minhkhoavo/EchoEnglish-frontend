import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ComposedChart,
  Bar,
  Area,
} from 'recharts';
import { CreditCard } from 'lucide-react';

interface PaymentTimelineChartProps {
  data?: Array<{
    revenue: number;
    creditsSold: number;
    successfulOrders: number;
    failedOrders: number;
    date: {
      year: number;
      month: number;
      day?: number;
    };
  }>;
  isLoading?: boolean;
  dateRangeBy?: 'day' | 'month' | 'year';
}

const paymentChartConfig = {
  creditsSold: {
    label: 'Credits Sold',
    color: '#8b5cf6', // violet-500 - more vibrant for area visibility
  },
  successfulOrders: {
    label: 'Successful Orders',
    color: '#06b6d4', // cyan-500 - complementary color for bars
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

export function PaymentTimelineChart({
  data,
  isLoading = false,
  dateRangeBy = 'month',
}: PaymentTimelineChartProps) {
  const chartData =
    data?.map((item) => {
      const formattedDate = formatDate(item.date, dateRangeBy);

      return {
        date: formattedDate,
        fullDate: formattedDate,
        creditsSold: item.creditsSold,
        successfulOrders: item.successfulOrders,
      };
    }) || [];

  // Calculate totals for summary
  const totals = chartData.reduce(
    (acc, item) => ({
      creditsSold: acc.creditsSold + item.creditsSold,
      successfulOrders: acc.successfulOrders + item.successfulOrders,
    }),
    { creditsSold: 0, successfulOrders: 0 }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Flow Timeline
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Credit flow trends showing stacked payment status over time
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
            <CreditCard className="h-5 w-5 text-blue-600" />
            Payment Performance Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Credits sold and successful orders over time
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <div className="text-lg font-bold text-violet-500">
              {totals.creditsSold.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Credits Sold</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-500">
              {totals.successfulOrders.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Successful Orders
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment timeline data available</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={paymentChartConfig}
            className="h-[320px] w-full"
          >
            <ComposedChart
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
                yAxisId="credits"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: '#8b5cf6' }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1) || 1]}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fontSize: 12, fill: '#06b6d4' }}
                tickFormatter={(value) => value.toLocaleString()}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1) || 1]}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-white/95 backdrop-blur-sm border shadow-lg"
                    labelFormatter={(value) => `Date: ${value}`}
                    formatter={(value, name) => {
                      const config =
                        paymentChartConfig[
                          name as keyof typeof paymentChartConfig
                        ];
                      if (name === 'creditsSold') {
                        return [
                          <span
                            className="font-semibold"
                            style={{ color: config?.color }}
                          >
                            {Number(value).toLocaleString()} credits
                          </span>,
                          config?.label || String(name),
                        ];
                      } else {
                        return [
                          <span
                            className="font-semibold"
                            style={{ color: config?.color }}
                          >
                            {Number(value).toLocaleString()} orders
                          </span>,
                          config?.label || String(name),
                        ];
                      }
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} className="mt-4" />

              <Area
                yAxisId="credits"
                type="linear"
                dataKey="creditsSold"
                stroke="#8b5cf6"
                fill="hsl(12, 76%, 61%)"
                fillOpacity={0.15}
                strokeWidth={3}
                name="creditsSold"
              />

              <Bar
                yAxisId="orders"
                dataKey="successfulOrders"
                fill="#06b6d4"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
                name="successfulOrders"
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
