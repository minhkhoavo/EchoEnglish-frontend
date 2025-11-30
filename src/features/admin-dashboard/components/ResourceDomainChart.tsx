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
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

interface ResourceDomainProps {
  data?: Array<{
    total: number;
    approvedCount: number;
    notApprovedCount: number;
    domain: string;
  }>;
  isLoading?: boolean;
}

const DOMAIN_COLORS = [
  '#3b82f6', // blue-500
  '#16a34a', // green-600
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

const resourceChartConfig = {
  total: {
    label: 'Total Resources',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function ResourceDomainChart({
  data,
  isLoading = false,
}: ResourceDomainProps) {
  const pieData =
    data
      ?.filter((item) => item.domain) // Filter out null domains
      ?.map((item, index) => ({
        domain: (item.domain || 'Unknown').replace('_', ' ').toUpperCase(),
        value: item.total,
        fill: DOMAIN_COLORS[index % DOMAIN_COLORS.length],
      })) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource by Domain (Pie + Table)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-pulse bg-muted h-64 w-64 rounded-full" />
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-muted h-12 w-full rounded-md"
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource by Domain (Pie + Table)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Pie Chart */}
          <div className="flex-1">
            {pieData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No resource domain data available
              </div>
            ) : (
              <ChartContainer
                config={resourceChartConfig}
                className="h-[300px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelKey="domain"
                        nameKey="domain"
                        hideLabel={true}
                      />
                    }
                  />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="domain"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ domain, value, percent }) =>
                      `${domain}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        className="bg-white/95 backdrop-blur-sm border shadow-lg"
                        labelFormatter={(value) => `Domain: ${value}`}
                        formatter={(value, name) => [
                          <span className="font-semibold text-blue-600">
                            {Number(value)} resources
                          </span>,
                          String(name),
                        ]}
                      />
                    }
                  />
                  {/* <ChartLegend 
                    content={<ChartLegendContent nameKey="domain" />}
                    wrapperStyle={{
                      fontSize: '14px',
                      paddingTop: '20px'
                    }}
                  /> */}
                </PieChart>
              </ChartContainer>
            )}
          </div>

          {/* Table */}
          <div className="flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((item, index) => {
                    const approvalRate =
                      item.total > 0
                        ? (item.approvedCount / item.total) * 100
                        : 0;
                    return (
                      <TableRow key={item.domain || `domain-${index}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full font-bold"
                              style={{
                                backgroundColor:
                                  DOMAIN_COLORS[index % DOMAIN_COLORS.length],
                              }}
                            />
                            <span>
                              {(item.domain || 'Unknown')
                                .replace('_', ' ')
                                .toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{item.total}</TableCell>
                        <TableCell>{item.approvedCount}</TableCell>
                        <TableCell>{item.notApprovedCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              approvalRate >= 75
                                ? 'bg-green-50 text-green-700 border-green-200 font-medium'
                                : approvalRate >= 50
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 font-medium'
                                  : 'bg-red-50 text-red-700 border-red-200 font-medium'
                            }
                          >
                            {approvalRate.toFixed(0)}% approved
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No resource domain data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
