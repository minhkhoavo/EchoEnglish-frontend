import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  CreditCard,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading = false,
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'neutral':
        return <Minus className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTrendTextColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="animate-pulse bg-muted h-8 w-16 rounded" />
          ) : (
            value
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs mt-1',
              getTrendTextColor()
            )}
          >
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardCardsProps {
  userStats?: {
    totalUsers?: number;
    timeline?: Array<{ count: number; date: { year: number; month: number } }>;
  };
  testStats?: {
    totalTests: number;
  };
  paymentStats?: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalRevenue: number;
    totalCreditsSold: number;
    conversionRate: number;
    averageOrderValue: number;
  };
  resourceStats?: {
    totalResources: number;
    approved: number;
    notApproved: number;
  };
  isLoading?: {
    users?: boolean;
    tests?: boolean;
    payments?: boolean;
    resources?: boolean;
  };
}

export function DashboardCards({
  userStats,
  testStats,
  paymentStats,
  resourceStats,
  isLoading = {},
}: DashboardCardsProps) {
  const successRate = paymentStats
    ? (paymentStats.successfulPayments / paymentStats.totalPayments) * 100
    : 0;

  const approvalRate = resourceStats
    ? (resourceStats.approved / resourceStats.totalResources) * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Users Card - Compact Version */}
      <Card className="border border-slate-200 hover:border-blue-300 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Total Users
              </p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading.users ? (
                  <div className="animate-pulse bg-slate-200 h-6 w-12 rounded" />
                ) : (
                  userStats?.totalUsers?.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Registered</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests Card - Compact Version */}
      <Card className="border border-slate-200 hover:border-green-300 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Total Tests
              </p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading.tests ? (
                  <div className="animate-pulse bg-slate-200 h-6 w-12 rounded" />
                ) : (
                  testStats?.totalTests?.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Card - Compact Version */}
      <Card className="border border-slate-200 hover:border-violet-300 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Payments
              </p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading.payments ? (
                  <div className="animate-pulse bg-slate-200 h-6 w-12 rounded" />
                ) : (
                  paymentStats?.totalPayments?.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs mt-1">
                <span
                  className={`font-medium ${successRate >= 80 ? 'text-green-600' : successRate >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                >
                  {successRate.toFixed(0)}% success
                </span>
                {paymentStats?.totalRevenue && (
                  <span className="text-slate-500 ml-2">
                    • ${(paymentStats.totalRevenue / 1000000).toFixed(1)}M
                  </span>
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Card - Compact Version */}
      <Card className="border border-slate-200 hover:border-orange-300 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                Resources
              </p>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {isLoading.resources ? (
                  <div className="animate-pulse bg-slate-200 h-6 w-12 rounded" />
                ) : (
                  resourceStats?.totalResources?.toLocaleString() || 0
                )}
              </div>
              <p className="text-xs mt-1">
                <span
                  className={`font-medium ${approvalRate >= 80 ? 'text-green-600' : approvalRate >= 50 ? 'text-amber-500' : 'text-red-500'}`}
                >
                  {resourceStats?.approved || 0} approved (
                  {approvalRate.toFixed(0)}%)
                </span>
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
