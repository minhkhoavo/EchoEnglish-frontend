import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, Check, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PromoCodeValidation } from '../types';

interface PromoCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate: (code: string, credits: number) => void;
  validation: PromoCodeValidation | null;
  isValidating: boolean;
  error: string | null;
  credits: number;
  disabled?: boolean;
  className?: string;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  value,
  onChange,
  onValidate,
  validation,
  isValidating,
  error,
  credits,
  disabled = false,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().trim();
    setLocalValue(newValue);
    onChange(newValue);
    setHasValidated(false);
  };

  const handleValidate = () => {
    if (localValue && credits > 0) {
      onValidate(localValue, credits);
      setHasValidated(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && localValue) {
      e.preventDefault();
      handleValidate();
    }
  };

  const formatDiscount = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const canValidate = localValue && credits > 0 && !isValidating && !disabled;
  const showValidation = hasValidated && validation;
  const isValid = !!validation?.data;
  const discountVnd = validation?.data?.discount || 0;
  const validationMessage = validation?.message || '';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input Section */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Promo Code
        </label>

        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter promo code..."
              value={localValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              className={`uppercase ${
                showValidation
                  ? isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : ''
              }`}
              maxLength={20}
            />

            {/* Status Icon */}
            {showValidation && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>

          <Button
            onClick={handleValidate}
            disabled={!canValidate}
            variant="outline"
            size="default"
            className="px-4"
          >
            {isValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      </div>

      {/* Validation Result */}
      {showValidation && validation && (
        <div className="space-y-2">
          {isValid ? (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex justify-between items-center">
                  <span>Promo code applied successfully!</span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    -{formatDiscount(discountVnd)}
                  </Badge>
                </div>
                {validationMessage && (
                  <p className="text-sm text-green-700 mt-1">
                    {validationMessage}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationMessage || 'Invalid promo code'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!showValidation && (
        <p className="text-xs text-muted-foreground">
          Enter a valid promo code to get discounts on your token purchase.
        </p>
      )}
    </div>
  );
};
