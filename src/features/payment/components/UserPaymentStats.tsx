import { StatCard } from '@/components/ui/stat-card';
import { DollarSign, Plus, Minus, CheckCircle, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

interface UserPaymentStatsProps {
  stats: {
    totalSpent: number;
    totalCreditsEarned: number;
    totalCreditsUsed: number;
    successfulPurchases: number;
    totalTransactions: number;
  };
}

export const UserPaymentStats = ({ stats }: UserPaymentStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <StatCard
        label="Total Spent"
        value={formatCurrency(stats.totalSpent)}
        icon={() => (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-2xl font-semibold">₫</span>
          </div>
        )}
        iconColor="text-blue-600"
        valueColor="text-blue-700"
        gradient="from-blue-50 to-white"
        borderColor="border-blue-200"
        size="md"
      />

      <StatCard
        label="Credits Purchased"
        value={`${stats.totalCreditsEarned.toLocaleString()} tokens`}
        icon={Plus}
        iconColor="text-emerald-500"
        valueColor="text-emerald-700"
        gradient="from-emerald-50 to-white"
        borderColor="border-emerald-200"
        size="md"
      />

      <StatCard
        label="Credits Used"
        value={`${stats.totalCreditsUsed.toLocaleString()} tokens`}
        icon={Minus}
        iconColor="text-orange-500"
        valueColor="text-orange-700"
        gradient="from-orange-50 to-white"
        borderColor="border-orange-200"
        size="md"
      />

      <StatCard
        label="Successful"
        value={stats.successfulPurchases}
        icon={CheckCircle}
        iconColor="text-green-500"
        valueColor="text-green-700"
        gradient="from-green-50 to-white"
        borderColor="border-green-200"
        size="md"
      />

      <StatCard
        label="Total Transactions"
        value={stats.totalTransactions}
        icon={BarChart3}
        iconColor="text-purple-600"
        valueColor="text-purple-700"
        gradient="from-purple-50 to-white"
        borderColor="border-purple-200"
        size="md"
      />
    </div>
  );
};
