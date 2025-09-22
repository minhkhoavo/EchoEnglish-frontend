import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, CreditCard, Tag } from 'lucide-react';
import type { CreditCalculation } from '../types';

interface PaymentSummaryProps {
  calculation: CreditCalculation | null;
  paymentMethod: string;
  isLoading?: boolean;
  className?: string;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  calculation,
  paymentMethod,
  isLoading = false,
  className = '',
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!calculation) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-6">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Select credits to see payment summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDiscount = calculation.discountVnd > 0;
  const discountPercentage =
    calculation.baseAmountVnd > 0
      ? ((calculation.discountVnd / calculation.baseAmountVnd) * 100).toFixed(1)
      : 0;

  return (
    <Card className={`${className} border-l-4 border-l-blue-500`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Receipt className="w-5 h-5 mr-2" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credits */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Credits to purchase:</span>
          <div className="text-right">
            <div className="font-semibold text-lg text-blue-600">
              {formatCredits(calculation.credits)}
            </div>
            <div className="text-xs text-gray-500">1 credit = 1,000 VND</div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Base Amount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base amount:</span>
          <span className="font-medium">
            {formatCurrency(calculation.baseAmountVnd)}
          </span>
        </div>

        {/* Discount */}
        {hasDiscount && (
          <div className="flex justify-between items-center text-green-600">
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Discount ({discountPercentage}%):
              {calculation.promoCode && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {calculation.promoCode}
                </Badge>
              )}
            </span>
            <span className="font-medium">
              -{formatCurrency(calculation.discountVnd)}
            </span>
          </div>
        )}

        <hr className="border-gray-200" />

        {/* Final Amount */}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total amount:</span>
          <div className="text-right">
            <div className="text-blue-600">
              {formatCurrency(calculation.finalAmountVnd)}
            </div>
            {hasDiscount && (
              <div className="text-sm text-gray-500 line-through">
                {formatCurrency(calculation.baseAmountVnd)}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center">
              <CreditCard className="w-4 h-4 mr-1" />
              Payment method:
            </span>
            <Badge variant="outline" className="text-sm">
              {paymentMethod}
            </Badge>
          </div>
        </div>

        {/* Savings */}
        {hasDiscount && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="text-center">
              <div className="text-green-800 font-medium">
                🎉 You save {formatCurrency(calculation.discountVnd)}!
              </div>
              <div className="text-sm text-green-600 mt-1">
                {discountPercentage}% discount applied
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
          <div className="font-medium mb-1">Note:</div>
          <ul className="space-y-1">
            <li>
              • Credits will be added to your account immediately after
              successful payment
            </li>
            <li>• Payment is secure and processed through {paymentMethod}</li>
            <li>• You can use credits for various services on our platform</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
