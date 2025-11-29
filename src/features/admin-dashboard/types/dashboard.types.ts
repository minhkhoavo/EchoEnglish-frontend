// Types for dashboard API responses

export interface UserStatsResponse {
  message: string;
  data: {
    totalUsers: number;
    timeline: Array<{
      count: number;
      date: {
        year: number;
        month: number;
        day?: number;
      };
    }>;
  };
}

export interface TestStatsResponse {
  message: string;
  data: {
    totalTests: number;
    timeline: Array<{
      count: number;
      date: {
        year: number;
        month: number;
      };
    }>;
    avgScoreByType: Array<{
      _id: string;
      avgScore: number;
      count: number;
    }>;
    topUsers: Array<{
      highestScore: number;
      totalTests: number;
      userId: string;
      fullName: string;
      email: string;
      address: string;
      image: string;
    }>;
  };
}

export interface PaymentStatsResponse {
  message: string;
  data: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalRevenue: number;
    totalCreditsSold: number;
    conversionRate: number;
    averageOrderValue: number;
    byGateway: Array<{
      count: number;
      revenue: number;
      credits: number;
      gateway: 'VNPAY' | 'STRIPE';
    }>;
    timeline: Array<{
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
  };
}

export interface ResourceStatsResponse {
  message: string;
  data: {
    totalResources: number;
    approved: number;
    notApproved: number;
    byDomain: Array<{
      total: number;
      approvedCount: number;
      notApprovedCount: number;
      domain: string;
    }>;
  };
}

export interface DashboardDateRange {
  from?: string;
  to?: string;
  by?: 'day' | 'week' | 'month' | 'year';
}

export interface DateRangeOption {
  label: string;
  value: string;
  from: string;
  to: string;
  by: 'day' | 'month' | 'year';
}
