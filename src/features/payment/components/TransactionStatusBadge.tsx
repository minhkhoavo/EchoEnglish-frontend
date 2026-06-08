import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { PaymentStatus } from '../types';
import {
  CheckCircle,
  Clock,
  Loader2,
  XCircle,
  AlertCircle,
  Ban,
  HelpCircle,
} from 'lucide-react';

interface TransactionStatusBadgeProps {
  status: PaymentStatus;
  expiredAt?: string;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({
  status,
  expiredAt,
}) => {
  // Auto convert status to EXPIRED if expired
  const getActualStatus = (): PaymentStatus => {
    if (expiredAt && status === 'INITIATED') {
      const now = new Date();
      const expiryDate = new Date(expiredAt);
      if (now > expiryDate) {
        return 'EXPIRED';
      }
    }
    return status;
  };

  const actualStatus = getActualStatus();

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCEEDED':
        return {
          variant: 'default' as const,
          className:
            'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
          label: 'Succeeded',
          icon: CheckCircle,
        };
      case 'INITIATED':
        return {
          variant: 'secondary' as const,
          className:
            'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
          label: 'Pending Payment',
          icon: Loader2,
        };
      case 'PENDING':
        return {
          variant: 'secondary' as const,
          className:
            'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
          label: 'Processing',
          icon: Loader2,
        };
      case 'FAILED':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
          label: 'Failed',
          icon: XCircle,
        };
      case 'EXPIRED':
        return {
          variant: 'outline' as const,
          className:
            'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
          label: 'Expired',
          icon: AlertCircle,
        };
      case 'CANCELED':
        return {
          variant: 'outline' as const,
          className:
            'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
          label: 'Canceled',
          icon: Ban,
        };
      default:
        return {
          variant: 'outline' as const,
          className:
            'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
          label: 'Unknown',
          icon: HelpCircle,
        };
    }
  };

  const config = getStatusConfig(actualStatus);
  const IconComponent = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} transition-all duration-200 px-2 py-1 text-xs flex items-center gap-1`}
    >
      <IconComponent
        className={`h-3 w-3 ${actualStatus === 'INITIATED' || actualStatus === 'PENDING' ? 'animate-spin' : ''}`}
      />
      {config.label}
    </Badge>
  );
};
