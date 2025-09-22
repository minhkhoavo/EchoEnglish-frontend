import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Check } from 'lucide-react';
import type { PaymentMethod } from '../types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  className?: string;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  disabled = false,
  className = '',
}) => {
  const paymentMethods = [
    {
      id: 'VNPAY' as PaymentMethod,
      name: 'VNPay',
      description: 'Thanh toán qua VNPay',
      icon: Smartphone,
      features: ['Hỗ trợ ATM', 'Internet Banking', 'Ví điện tử'],
      popular: true,
      processingTime: 'Tức thì',
    },
    {
      id: 'STRIPE' as PaymentMethod,
      name: 'Stripe',
      description: 'Thanh toán qua thẻ quốc tế',
      icon: CreditCard,
      features: ['Visa/Mastercard', 'American Express', 'Bảo mật cao'],
      popular: false,
      processingTime: '1-2 phút',
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium text-gray-700">
        Payment Method
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <Card
              key={method.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                  : 'hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onMethodChange(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {method.name}
                        </h3>
                        {method.popular && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            Phổ biến
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {method.description}
                      </p>

                      <div className="space-y-1">
                        {method.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center text-xs text-gray-500"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-xs text-gray-500">
                        <span className="font-medium">Processing time:</span>{' '}
                        {method.processingTime}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-1 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p>
          All payments are processed securely using industry-standard
          encryption. Your payment information is protected and never stored on
          our servers.
        </p>
      </div>
    </div>
  );
};
