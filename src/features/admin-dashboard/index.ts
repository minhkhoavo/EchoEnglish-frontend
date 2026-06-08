// Main Dashboard Component
export { default } from '../../pages/admin/AdminDashboardPage';

// Individual Components
export { DashboardCards } from './components/DashboardCards';
export { UserStatsChart } from './components/UserStatsChart';
export {
  TestStatsChart,
  AvgScoreTable,
  TopUsers,
} from './components/TestStatsComponents';
export { PaymentTimelineChart } from './components/PaymentTimelineChart';
export {
  PaymentStatusTable,
  PaymentGatewayTable,
} from './components/PaymentTables';
export { ResourceDomainChart } from './components/ResourceDomainChart';
export {
  DateRangeSelector,
  DATE_RANGE_OPTIONS,
} from './components/DateRangeSelector';

// API Services
export {
  useGetUserGrowthStatsQuery,
  useGetTestStatsQuery,
  useGetPaymentStatsQuery,
  useGetResourceStatsQuery,
} from './services/dashboardApi';

// Types
export type {
  UserStatsResponse,
  TestStatsResponse,
  PaymentStatsResponse,
  ResourceStatsResponse,
  DashboardDateRange,
  DateRangeOption,
} from './types/dashboard.types';
