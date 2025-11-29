import { StatCard } from '@/components/ui/stat-card';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        label="Total Amount"
        value={formatCurrency(stats.totalAmount)}
        icon={() => (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-2xl font-semibold">₫</span>
          </div>
        )}
        iconColor=""
        valueColor="text-blue-700"
        gradient="from-blue-50 to-white"
        borderColor="border-blue-200"
        size="md"
      />

      <StatCard
        label="Transactions"
        value={stats.totalTransactions.toLocaleString()}
        icon={() => (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 text-2xl font-semibold">#</span>
          </div>
        )}
        iconColor=""
        valueColor="text-purple-700"
        gradient="from-purple-50 to-white"
        borderColor="border-purple-200"
        size="md"
      />

      <StatCard
        label="Succeeded"
        value={stats.succeeded}
        icon={CheckCircle2}
        iconColor="text-green-500"
        valueColor="text-green-700"
        gradient="from-green-50 to-white"
        borderColor="border-green-200"
        size="md"
      />

      <StatCard
        label="Failed"
        value={stats.failed}
        icon={XCircle}
        iconColor="text-red-500"
        valueColor="text-red-700"
        gradient="from-red-50 to-white"
        borderColor="border-red-200"
        size="md"
      />

      <StatCard
        label="Purchased"
        value={`${stats.purchased.toLocaleString()} tokens`}
        icon={ArrowUpCircle}
        iconColor="text-emerald-500"
        valueColor="text-emerald-700"
        gradient="from-emerald-50 to-white"
        borderColor="border-emerald-200"
        size="md"
      />

      <StatCard
        label="Used"
        value={`${stats.used.toLocaleString()} tokens`}
        icon={ArrowDownCircle}
        iconColor="text-orange-500"
        valueColor="text-orange-700"
        gradient="from-orange-50 to-white"
        borderColor="border-orange-200"
        size="md"
      />
    </div>
  );
};
