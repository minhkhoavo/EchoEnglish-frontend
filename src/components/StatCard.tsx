import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  valueColor?: string;
  borderColor?: string;
  subtitle?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
  valueColor = 'text-slate-900',
  borderColor = 'border-slate-200',
  subtitle,
}: StatCardProps) => {
  return (
    <Card
      className={`${borderColor} hover:shadow-md transition-all duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              {label}
            </p>
            <div className={`text-2xl font-bold ${valueColor} mt-1`}>
              {value}
            </div>
            {subtitle ? (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            ) : null}
          </div>
          <div
            className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
