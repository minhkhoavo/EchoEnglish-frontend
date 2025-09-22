import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Home, RefreshCw } from 'lucide-react';
import type { PaymentStatus } from '../features/payment/types';
import { PaymentStatus as PaymentStatusComponent } from '@/features/payment/components/PaymentStatus';

const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract payment parameters from URL
  const paymentId = searchParams.get('paymentId');
  const status = searchParams.get('status') as PaymentStatus;
  const amount = searchParams.get('amount');
  const credits = searchParams.get('tokens');
  const method = searchParams.get('method');

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/payment');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const getStatusMessage = () => {
    switch (status) {
      case 'SUCCEEDED':
        return {
          title: 'Payment Successful!',
          message: 'Your credits have been added to your account.',
          icon: CheckCircle,
          color: 'text-green-600',
        };
      case 'FAILED':
        return {
          title: 'Payment Failed',
          message: 'There was an issue processing your payment.',
          icon: XCircle,
          color: 'text-red-600',
        };
      case 'PENDING':
        return {
          title: 'Payment Pending',
          message: 'Your payment is being processed.',
          icon: Clock,
          color: 'text-yellow-600',
        };
      default:
        return {
          title: 'Payment Status Unknown',
          message: 'Please check your transaction history.',
          icon: Clock,
          color: 'text-gray-600',
        };
    }
  };

  const statusInfo = getStatusMessage();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader className="text-center pb-4">
            <div
              className={`mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4`}
            >
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
            </div>
            <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{statusInfo.message}</p>

            {/* Payment Details */}
            {paymentId && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
                {credits && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-semibold">{credits}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {parseInt(amount).toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                )}
                {method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span>{method}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/payment')}
                className="w-full"
                variant={status === 'SUCCEEDED' ? 'default' : 'outline'}
              >
                <Home className="w-4 h-4 mr-2" />
                {status === 'SUCCEEDED' ? 'Buy More Credits' : 'Try Again'}
              </Button>

              <Button
                onClick={() => navigate('/payment/history')}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                View Transaction History
              </Button>
            </div>

            {/* Auto-redirect notice */}
            <p className="text-xs text-gray-500">
              Redirecting to payment page in {countdown} seconds...
            </p>
          </CardContent>
        </Card>

        {/* Payment Status Component */}
        {paymentId && status && (
          <PaymentStatusComponent
            status={status}
            paymentId={paymentId}
            expiryTime={
              status === 'PENDING'
                ? new Date(Date.now() + 600000).toISOString()
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
