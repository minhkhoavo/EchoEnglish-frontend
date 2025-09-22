import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import type { PaymentStatus as PaymentStatusType } from '../types';

interface PaymentStatusProps {
  status: PaymentStatusType;
  paymentId?: string;
  expiryTime?: string;
  className?: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  paymentId,
  expiryTime,
  className = '',
}) => {
  const getStatusConfig = (status: PaymentStatusType) => {
    switch (status) {
      case 'INITIATED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Loader2,
          iconColor: 'text-blue-600',
          title: 'Payment Initiated',
          description: 'Payment request has been created',
          animate: true,
        };
      case 'PENDING':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          iconColor: 'text-yellow-600',
          title: 'Payment Pending',
          description: 'Waiting for payment confirmation',
          animate: false,
        };
      case 'SUCCEEDED':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
          title: 'Payment Successful',
          description: 'Payment completed successfully',
          animate: false,
        };
      case 'FAILED':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          title: 'Payment Failed',
          description: 'Payment could not be processed',
          animate: false,
        };
      case 'EXPIRED':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          title: 'Payment Expired',
          description: 'Payment session has expired',
          animate: false,
        };
      case 'CANCELED':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle,
          iconColor: 'text-gray-600',
          title: 'Payment Canceled',
          description: 'Payment was canceled by user',
          animate: false,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          iconColor: 'text-gray-600',
          title: 'Unknown Status',
          description: 'Payment status is unknown',
          animate: false,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const formatExpiryTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const isTimeShown =
    expiryTime && (status === 'INITIATED' || status === 'PENDING');

  return (
    <Card
      className={`${className} border-l-4`}
      style={{ borderLeftColor: config.iconColor.replace('text-', '#') }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Icon
              className={`w-5 h-5 mr-2 ${config.iconColor} ${
                config.animate ? 'animate-spin' : ''
              }`}
            />
            {config.title}
          </div>
          <Badge className={config.color}>{status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">{config.description}</p>

        {paymentId && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">Payment ID:</span>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
              {paymentId}
            </code>
          </div>
        )}

        {isTimeShown && (
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">Time remaining:</span>
            <span className="ml-2 text-orange-600 font-medium">
              {formatExpiryTime(expiryTime)}
            </span>
          </div>
        )}

        {/* Status-specific additional info */}
        {status === 'SUCCEEDED' && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">
                Tokens have been added to your account!
              </span>
            </div>
          </div>
        )}

        {status === 'FAILED' && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="text-red-800">
              <div className="font-medium mb-1">What to do next:</div>
              <ul className="text-sm space-y-1">
                <li>• Check your payment method details</li>
                <li>• Ensure sufficient funds are available</li>
                <li>• Try a different payment method</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          </div>
        )}

        {status === 'EXPIRED' && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
            <div className="text-gray-800">
              <div className="font-medium mb-1">Payment session expired</div>
              <p className="text-sm">
                Please create a new payment request to continue with your token
                purchase.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
