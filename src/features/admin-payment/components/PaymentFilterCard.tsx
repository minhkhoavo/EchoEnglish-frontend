import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';
import type { PaymentFilters } from '../types/payment.types';

interface PaymentFilterCardProps {
  filters: PaymentFilters;
  onFilter: (filters: PaymentFilters) => void;
}

export const PaymentFilterCard = ({
  filters,
  onFilter,
}: PaymentFilterCardProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<PaymentFilters>(filters);
  const [resetKey, setResetKey] = useState(0);

  const handleChange = (key: keyof PaymentFilters, value: string | number) => {
    setTempFilters({ ...tempFilters, [key]: value });
  };

  const applyFilters = () => {
    onFilter(tempFilters);
  };

  const clearFilters = () => {
    const emptyFilters: PaymentFilters = { limit: 10, sort: 'desc' };
    setTempFilters(emptyFilters);
    onFilter(emptyFilters);
    setResetKey((prev) => prev + 1);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">
              Transaction Filters
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {showFilters ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm">Show</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {showFilters && (
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Transaction Type */}
            <div>
              <Label className="mb-2 block">Transaction Type</Label>
              <Select
                key={`type-${resetKey}`}
                value={tempFilters.type || ''}
                onValueChange={(v) => handleChange('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="deduction">Deduction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Payment Gateway */}
            <div>
              <Label className="mb-2 block">Payment Gateway</Label>
              <Select
                key={`gateway-${resetKey}`}
                value={tempFilters.gateway || ''}
                onValueChange={(v) => handleChange('gateway', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Stripe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VNPAY">VNPay</SelectItem>
                  <SelectItem value="STRIPE">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status */}
            <div>
              <Label className="mb-2 block">Status</Label>
              <Select
                key={`status-${resetKey}`}
                value={tempFilters.status || ''}
                onValueChange={(v) => handleChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIATED">Initiated</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUCCEEDED">Succeeded</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELED">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Email */}
            <div>
              <Label className="mb-2 block">Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by user email"
                  value={tempFilters.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* From Date */}
            <div>
              <Label className="mb-2 block">From Date</Label>
              <Input
                type="date"
                value={tempFilters.fromDate || ''}
                onChange={(e) => handleChange('fromDate', e.target.value)}
              />
            </div>
            {/* To Date */}
            <div>
              <Label className="mb-2 block">To Date</Label>
              <Input
                type="date"
                value={tempFilters.toDate || ''}
                onChange={(e) => handleChange('toDate', e.target.value)}
              />
            </div>
            {/* Sort Order */}
            <div>
              <Label className="mb-2 block">Sort Order</Label>
              <Select
                key={`sort-${resetKey}`}
                value={tempFilters.sort || 'desc'}
                onValueChange={(v) => handleChange('sort', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Latest First" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Latest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items per page */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">
                Items per page:
              </Label>
              <Select
                key={`limit-${resetKey}`}
                value={String(tempFilters.limit || 10)}
                onValueChange={(v) => handleChange('limit', Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="bg-white/80 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
            >
              Clear All
            </Button>
            <Button
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
