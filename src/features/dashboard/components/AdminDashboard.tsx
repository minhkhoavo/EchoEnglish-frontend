import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Import dashboard components
import { DashboardCards } from './DashboardCards';
import { UserStatsChart } from './UserStatsChart';
import { TestStatsChart, AvgScoreTable, TopUsers } from './TestStatsComponents';
import { PaymentTimelineChart } from './PaymentTimelineChart';
import { PaymentStatusTable, PaymentGatewayTable } from './PaymentTables';
import { ResourceDomainChart } from './ResourceDomainChart';
import { DateRangeSelector, DATE_RANGE_OPTIONS } from './DateRangeSelector';

// Import API hooks
import {
  useGetUserGrowthStatsQuery,
  useGetTestStatsQuery,
  useGetPaymentStatsQuery,
  useGetResourceStatsQuery,
} from '../services/dashboardApi';

import type { DateRangeOption } from '../types/dashboard.types';

export function AdminDashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>(
    DATE_RANGE_OPTIONS.find((opt) => opt.value === 'last-30-days') ||
      DATE_RANGE_OPTIONS[2]
  );

  const dateRangeParams = {
    from: selectedDateRange.from,
    to: selectedDateRange.to,
    by: selectedDateRange.by,
  };

  // API calls
  const {
    data: userStatsData,
    isLoading: isUserStatsLoading,
    error: userStatsError,
    refetch: refetchUserStats,
  } = useGetUserGrowthStatsQuery(dateRangeParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: testStatsData,
    isLoading: isTestStatsLoading,
    refetch: refetchTestStats,
  } = useGetTestStatsQuery(dateRangeParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: paymentStatsData,
    isLoading: isPaymentStatsLoading,
    refetch: refetchPaymentStats,
  } = useGetPaymentStatsQuery(dateRangeParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: resourceStatsData,
    isLoading: isResourceStatsLoading,
    refetch: refetchResourceStats,
  } = useGetResourceStatsQuery();

  const handleRefresh = () => {
    refetchUserStats();
    refetchTestStats();
    refetchPaymentStats();
    refetchResourceStats();
  };

  const isAnyLoading =
    isUserStatsLoading ||
    isTestStatsLoading ||
    isPaymentStatsLoading ||
    isResourceStatsLoading;

  const handleDateRangeChange = (option: DateRangeOption) => {
    setSelectedDateRange(option);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of system statistics and metrics
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="h-8">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Date Range Selector */}
        <DateRangeSelector
          value={selectedDateRange.value}
          onChange={handleDateRangeChange}
        />

        {/* Top Stats Cards Row */}
        <DashboardCards
          userStats={userStatsData?.data}
          testStats={testStatsData?.data}
          paymentStats={paymentStatsData?.data}
          resourceStats={resourceStatsData?.data}
          isLoading={{
            users: isUserStatsLoading,
            tests: isTestStatsLoading,
            payments: isPaymentStatsLoading,
            resources: isResourceStatsLoading,
          }}
        />

        {/* Charts and Tables Grid */}
        <div className="space-y-6">
          {/* User Stats Chart Row */}
          <UserStatsChart
            data={userStatsData?.data?.timeline}
            isLoading={isUserStatsLoading}
            dateRangeBy={selectedDateRange.by}
          />

          {/* Test Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TestStatsChart
              data={testStatsData?.data?.timeline}
              isLoading={isTestStatsLoading}
              dateRangeBy={selectedDateRange.by}
            />
            <AvgScoreTable
              data={testStatsData?.data?.avgScoreByType}
              isLoading={isTestStatsLoading}
            />
            <TopUsers
              data={testStatsData?.data?.topUsers}
              isLoading={isTestStatsLoading}
            />
          </div>

          {/* Payment Stats Row */}
          <div className="space-y-6">
            <PaymentTimelineChart
              data={paymentStatsData?.data?.timeline}
              isLoading={isPaymentStatsLoading}
              dateRangeBy={selectedDateRange.by}
            />

            {/* Payment Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PaymentStatusTable
                data={[
                  {
                    status: 'SUCCEEDED',
                    count: paymentStatsData?.data?.successfulPayments ?? 0,
                  },
                  {
                    status: 'FAILED',
                    count:
                      (paymentStatsData?.data?.totalPayments ?? 0) -
                      (paymentStatsData?.data?.successfulPayments ?? 0),
                  },
                ]}
                totalPayments={paymentStatsData?.data?.totalPayments ?? 0}
                isLoading={isPaymentStatsLoading}
              />
              <PaymentGatewayTable
                data={paymentStatsData?.data?.byGateway}
                totalPayments={paymentStatsData?.data?.totalPayments || 0}
                isLoading={isPaymentStatsLoading}
              />
            </div>
          </div>

          {/* Resources Row */}
          <ResourceDomainChart
            data={resourceStatsData?.data?.byDomain}
            isLoading={isResourceStatsLoading}
          />
        </div>
      </div>

      {/* Loading Overlay */}
      {isAnyLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
