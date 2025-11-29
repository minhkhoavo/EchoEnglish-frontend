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
import { Progress } from '@/components/ui/progress';

// Payment Status Table Component
interface PaymentStatusTableProps {
  data?: Array<{
    count: number;
    status: 'FAILED' | 'INITIATED' | 'SUCCEEDED' | 'EXPIRED';
  }>;
  totalPayments?: number;
  isLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCEEDED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
    case 'FAILED':
      return 'bg-red-50 text-red-700 border-red-200 font-medium';
    case 'EXPIRED':
      return 'bg-orange-50 text-orange-700 border-orange-200 font-medium';
    case 'INITIATED':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 font-medium';
  }
};

export function PaymentStatusTable({
  data,
  totalPayments = 0,
  isLoading = false,
}: PaymentStatusTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>By Status Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
        <CardTitle>By Status Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item) => {
                const percentage =
                  totalPayments > 0 ? (item.count / totalPayments) * 100 : 0;
                return (
                  <TableRow key={item.status}>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.count.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No payment status data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Payment Gateway Table Component
interface PaymentGatewayTableProps {
  data?: Array<{
    count: number;
    gateway: 'VNPAY' | 'STRIPE';
  }>;
  totalPayments?: number;
  isLoading?: boolean;
}

const getGatewayColor = (gateway: string) => {
  switch (gateway) {
    case 'VNPAY':
      return 'bg-blue-50 text-blue-700 border-blue-200 font-medium';
    case 'STRIPE':
      return 'bg-violet-50 text-violet-700 border-violet-200 font-medium';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 font-medium';
  }
};

export function PaymentGatewayTable({
  data,
  totalPayments = 0,
  isLoading = false,
}: PaymentGatewayTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>By Gateway Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
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
        <CardTitle>By Gateway Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gateway</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((item) => {
                const percentage =
                  totalPayments > 0 ? (item.count / totalPayments) * 100 : 0;
                return (
                  <TableRow key={item.gateway}>
                    <TableCell>
                      <Badge className={getGatewayColor(item.gateway)}>
                        {item.gateway}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.count.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={percentage} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No payment gateway data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
