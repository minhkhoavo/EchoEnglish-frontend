import { StatCard } from '@/components/StatCard';
import { Users, UserCheck, UserX, Coins } from 'lucide-react';
import type { UserStats } from '../types/user.types';

interface UserStatsOverviewProps {
  stats: UserStats;
}

export const UserStatsOverview = ({ stats }: UserStatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-50"
        borderColor="border-blue-200"
        subtitle="Registered"
      />
      <StatCard
        label="Active Users"
        value={stats.activeUsers.toLocaleString()}
        icon={UserCheck}
        iconColor="text-green-600"
        iconBgColor="bg-green-50"
        borderColor="border-green-200"
        subtitle="Not deleted"
      />
      <StatCard
        label="Deleted Users"
        value={stats.deletedUsers.toLocaleString()}
        icon={UserX}
        iconColor="text-red-600"
        iconBgColor="bg-red-50"
        borderColor="border-red-200"
        subtitle="Soft deleted"
      />
      <StatCard
        label="Total Credits"
        value={stats.totalCredits.toLocaleString()}
        icon={Coins}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-50"
        borderColor="border-amber-200"
        subtitle="All users"
      />
    </div>
  );
};
