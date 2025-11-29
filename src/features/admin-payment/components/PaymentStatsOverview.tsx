import { StatCard } from '@/components/StatCard';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Receipt,
} from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface PaymentStatsOverviewProps {
  stats: {
    totalAmount: number;
    totalTransactions: number;
    succeeded: number;
    failed: number;
    purchased: number;
    used: number;
  };
}

export const PaymentStatsOverview = ({ stats }: PaymentStatsOverviewProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        label="Total Amount"
        value={formatCurrency(stats.totalAmount)}
        icon={BarChart3}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-50"
        borderColor="border-blue-200"
        subtitle="Revenue"
      />

      <StatCard
        label="Transactions"
        value={stats.totalTransactions.toLocaleString()}
        icon={Receipt}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50"
        borderColor="border-purple-200"
        subtitle="Total"
      />

      <StatCard
        label="Succeeded"
        value={stats.succeeded.toLocaleString()}
        icon={CheckCircle2}
        iconColor="text-green-600"
        iconBgColor="bg-green-50"
        borderColor="border-green-200"
        subtitle="Success"
      />

      <StatCard
        label="Failed"
        value={stats.failed.toLocaleString()}
        icon={XCircle}
        iconColor="text-red-600"
        iconBgColor="bg-red-50"
        borderColor="border-red-200"
        subtitle="Errors"
      />

      <StatCard
        label="Purchased"
        value={stats.purchased.toLocaleString()}
        icon={ArrowUpCircle}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-50"
        borderColor="border-emerald-200"
        subtitle="tokens"
      />

      <StatCard
        label="Used"
        value={stats.used.toLocaleString()}
        icon={ArrowDownCircle}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-50"
        borderColor="border-orange-200"
        subtitle="tokens"
      />
    </div>
  );
};
