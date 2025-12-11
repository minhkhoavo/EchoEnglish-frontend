import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Import dashboard components
import { DashboardCards } from '@/features/admin-dashboard/components/DashboardCards';
import { UserStatsChart } from '@/features/admin-dashboard/components/UserStatsChart';
import {
  TestStatsChart,
  AvgScoreTable,
  TopUsers,
} from '@/features/admin-dashboard/components/TestStatsComponents';
import { PaymentTimelineChart } from '@/features/admin-dashboard/components/PaymentTimelineChart';
import {
  PaymentStatusTable,
  PaymentGatewayTable,
} from '@/features/admin-dashboard/components/PaymentTables';
import { ResourceDomainChart } from '@/features/admin-dashboard/components/ResourceDomainChart';
import {
  DateRangeSelector,
  DATE_RANGE_OPTIONS,
} from '@/features/admin-dashboard/components/DateRangeSelector';

// Import API hooks
import {
  useGetUserGrowthStatsQuery,
  useGetTestStatsQuery,
  useGetPaymentStatsQuery,
  useGetResourceStatsQuery,
} from '@/features/admin-dashboard/services/dashboardApi';

import type { DateRangeOption } from '@/features/admin-dashboard/types/dashboard.types';

export function AdminDashboardPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {isAnyLoading ? (
        <LoadingSpinner message="Loading dashboard data..." />
      ) : (
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Overview of system statistics and metrics
                  </p>
                </div>
              </div>
              <Button onClick={handleRefresh} variant="outline" className="h-8">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
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
      )}
    </div>
  );
}

export default AdminDashboardPage;
