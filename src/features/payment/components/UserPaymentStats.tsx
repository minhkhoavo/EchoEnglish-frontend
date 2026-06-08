import { StatCard } from '@/components/StatCard';
import { Plus, Minus, CheckCircle, BarChart3, Receipt } from 'lucide-react';
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="Total Spent"
        value={formatCurrency(stats.totalSpent)}
        icon={BarChart3}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-50"
        borderColor="border-blue-200"
        subtitle="VND"
      />

      <StatCard
        label="Total Transactions"
        value={stats.totalTransactions.toLocaleString()}
        icon={Receipt}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50"
        borderColor="border-purple-200"
        subtitle="all time"
      />

      <StatCard
        label="Credits Purchased"
        value={`${stats.totalCreditsEarned.toLocaleString()}`}
        icon={Plus}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-50"
        borderColor="border-emerald-200"
        subtitle="tokens"
      />

      <StatCard
        label="Credits Used"
        value={`${stats.totalCreditsUsed.toLocaleString()}`}
        icon={Minus}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-50"
        borderColor="border-orange-200"
        subtitle="tokens"
      />

      <StatCard
        label="Successful"
        value={stats.successfulPurchases.toLocaleString()}
        icon={CheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-50"
        borderColor="border-green-200"
        subtitle="purchases"
      />
    </div>
  );
};
