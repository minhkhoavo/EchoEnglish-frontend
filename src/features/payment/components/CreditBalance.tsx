import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Wallet } from 'lucide-react';
import type { UserBalance } from '../types';

interface CreditBalanceProps {
  balance: UserBalance | null;
  isLoading?: boolean;
  className?: string;
}

export const CreditBalance: React.FC<CreditBalanceProps> = ({
  balance,
  isLoading = false,
  className = '',
}) => {
  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-400">--</div>
          <p className="text-xs text-muted-foreground">No balance data</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Available Credits */}
          <div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(balance.credits)}
              </div>
              <Badge variant="secondary" className="text-xs">
                <Coins className="w-3 h-3 mr-1" />
                Credits
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {formatNumber(balance.credits * 1000)} VND
            </p>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Last updated: {formatDateTime(balance.lastUpdated)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
