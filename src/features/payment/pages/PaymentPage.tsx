import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Coins, Loader2, AlertCircle } from 'lucide-react';

import {
  CreditBalance,
  PaymentMethodSelector,
  PromoCodeInput,
  PaymentSummary,
} from '../components';

import {
  useCreatePaymentMutation,
  useValidatePromoCodeMutation,
} from '../services/paymentApi';
import type { CreditCalculation, PaymentMethod } from '../types';

const PaymentPage: React.FC = () => {
  // RTK Query hooks
  const [createPayment, { isLoading: isCreatingPayment, error: paymentError }] =
    useCreatePaymentMutation();
  const [
    validatePromoCode,
    { data: promoValidation, isLoading: isValidatingPromo },
  ] = useValidatePromoCodeMutation();

  // Local state
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('VNPAY');
  const [currentPromoCode, setCurrentPromoCode] = useState<string>('');
  const [calculation, setCalculation] = useState<CreditCalculation | null>(
    null
  );

  // Predefined credit amounts
  const presetAmounts = [50, 100, 250, 500, 1000];

  // Calculate payment amount when tokens or promo code changes
  useEffect(() => {
    if (creditAmount > 0) {
      const baseAmount = creditAmount * 1000;
      const discountAmount = promoValidation?.data?.isValid
        ? promoValidation.data.discountVnd
        : 0;
      const finalAmount = Math.max(0, baseAmount - discountAmount);

      setCalculation({
        credits: creditAmount,
        baseAmountVnd: baseAmount,
        discountVnd: discountAmount,
        finalAmountVnd: finalAmount,
        promoCode: promoValidation?.data?.isValid
          ? currentPromoCode
          : undefined,
      });
    }
  }, [creditAmount, promoValidation, currentPromoCode]);

  const handleCreatePayment = async () => {
    if (!calculation) return;

    try {
      const result = await createPayment({
        credits: calculation.credits,
        paymentGateway: selectedPaymentMethod,
        description: `Purchase ${calculation.credits} credits via ${selectedPaymentMethod}`,
      }).unwrap();

      // Redirect to payment URL
      if (result.data?.payUrl) {
        window.location.href = result.data.payUrl;
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePromoCodeChange = (code: string) => {
    setCurrentPromoCode(code);
  };

  const handlePromoCodeValidate = async (code: string) => {
    try {
      await validatePromoCode({ code, credits: creditAmount });
    } catch (error) {
      console.error('Promo code validation failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Purchase Tokens
          </h1>
          <p className="text-gray-600">
            Buy tokens to access EchoEnglish features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Details */}
          <div className="space-y-6">
            {/* Token Selection */}
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-gray-600" />
                  Select Token Amount
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset amounts */}
                <div className="grid grid-cols-5 gap-2">
                  {presetAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={creditAmount === amount ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCreditAmount(amount)}
                      className="text-sm h-8"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Custom Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter token amount"
                    value={creditAmount}
                    onChange={(e) =>
                      setCreditAmount(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    min={1}
                    max={10000}
                    className="h-9"
                  />
                  <p className="text-xs text-gray-500">
                    Rate: 1000 VND = 1 token
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <PaymentMethodSelector
              selectedMethod={selectedPaymentMethod}
              onMethodChange={handlePaymentMethodChange}
            />

            {/* Error Display */}
            {paymentError && (
              <Alert variant="destructive" className="border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {typeof paymentError === 'string'
                    ? paymentError
                    : 'An error occurred'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            {calculation && (
              <Card className="border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Credits</span>
                      <span className="font-semibold text-gray-900">
                        {calculation.credits}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(calculation.baseAmountVnd)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">
                        {calculation.discountVnd > 0
                          ? `-${formatCurrency(calculation.discountVnd)}`
                          : '-0 VND'}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-base font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {formatCurrency(calculation.finalAmountVnd)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Code below total */}
                  <div className="pt-4 border-t border-gray-200">
                    <PromoCodeInput
                      value={currentPromoCode || ''}
                      onChange={handlePromoCodeChange}
                      onValidate={handlePromoCodeValidate}
                      validation={promoValidation?.data || null}
                      credits={creditAmount}
                      isValidating={isValidatingPromo}
                      error={null}
                      disabled={false}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Button */}
            <Button
              onClick={handleCreatePayment}
              disabled={
                !calculation || !selectedPaymentMethod || isCreatingPayment
              }
              className="w-full h-11 text-base"
              size="lg"
            >
              {isCreatingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay{' '}
                  {calculation
                    ? formatCurrency(calculation.finalAmountVnd)
                    : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
