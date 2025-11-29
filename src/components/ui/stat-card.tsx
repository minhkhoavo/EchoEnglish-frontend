import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon | (() => ReactNode);
  iconColor?: string;
  valueColor?: string;
  gradient?: string;
  borderColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  valueColor = 'text-blue-700',
  gradient = 'from-blue-50 to-white',
  borderColor = 'border-blue-200',
  size = 'md',
}: StatCardProps) => {
  const sizeClasses = {
    sm: { card: 'p-3', icon: 'h-3 w-3', label: 'text-xs', value: 'text-lg' },
    md: { card: 'p-4', icon: 'h-8 w-8', label: 'text-xs', value: 'text-xl' },
    lg: { card: 'p-5', icon: 'h-10 w-10', label: 'text-sm', value: 'text-2xl' },
  };

  const classes = sizeClasses[size];

  // Check if Icon is a custom component (no displayName) vs LucideIcon (has displayName)
  const isCustomIcon =
    typeof Icon === 'function' &&
    !(Icon as { displayName?: string }).displayName;

  return (
    <Card
      className={`${borderColor} bg-gradient-to-br ${gradient} hover:shadow-md transition-shadow`}
    >
      <CardContent className={classes.card}>
        <div className="flex items-center justify-between mb-1">
          <span className={`${classes.label} font-medium text-gray-600`}>
            {label}
          </span>
          {isCustomIcon ? (
            <Icon />
          ) : (
            <Icon className={`${classes.icon} ${iconColor}`} />
          )}
        </div>
        <p className={`${classes.value} font-bold ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
};
