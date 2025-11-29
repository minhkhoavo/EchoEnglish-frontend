import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import type { TransactionFilters } from '../types';
import { TransactionType, PaymentMethod } from '../types';
import {
  Calendar,
  Filter,
  X,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  onClearFilters: () => void;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export const TransactionFiltersComponent: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  compact = false,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [tempFilters, setTempFilters] = useState<TransactionFilters>(filters);

  const handleFilterChange = (
    key: keyof TransactionFilters,
    value: string | number | undefined
  ) => {
    setTempFilters({
      ...tempFilters,
      [key]: value === 'all' || value === '' ? undefined : value,
    });
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-3 w-3 text-red-600" />;
      case 'INITIATED':
        return <Clock className="h-3 w-3 text-blue-600" />;
      case 'EXPIRED':
        return <AlertCircle className="h-3 w-3 text-orange-600" />;
      default:
        return null;
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(
      (value) => value !== undefined && value !== null && value !== 20
    ).length; // Exclude default limit
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Header - Always visible */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                size="sm"
                className="h-6 px-2 text-xs text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Filters Content - Collapsible */}
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* Transaction Type */}
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="h-8 w-28 text-xs border-gray-300 bg-white hover:bg-gray-50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={TransactionType.PURCHASE}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-green-600" />
                      Purchase
                    </div>
                  </SelectItem>
                  <SelectItem value={TransactionType.DEDUCTION}>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-3 w-3 text-red-600" />
                      Usage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Payment Gateway */}
              <Select
                value={filters.paymentGateway || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('paymentGateway', value)
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs border-gray-300 bg-white hover:bg-gray-50">
                  <SelectValue placeholder="Gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value={PaymentMethod.STRIPE}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Stripe
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentMethod.VNPAY}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      VNPay
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="h-8 w-24 text-xs border-gray-300 bg-white hover:bg-gray-50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUCCEEDED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('SUCCEEDED')}
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value="INITIATED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('INITIATED')}
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="FAILED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('FAILED')}
                      Failed
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPIRED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('EXPIRED')}
                      Expired
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <div className="relative">
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('dateFrom', e.target.value)
                  }
                  className="h-8 w-36 text-xs border-gray-300 bg-white pl-8"
                  placeholder="From date"
                />
                <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>

              {/* Date To */}
              <div className="relative">
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="h-8 w-36 text-xs border-gray-300 bg-white pl-8"
                  placeholder="To date"
                />
                <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>

              {/* Records */}
              <Select
                value={filters.limit?.toString() || '20'}
                onValueChange={(value) =>
                  handleFilterChange('limit', parseInt(value))
                }
              >
                <SelectTrigger className="h-8 w-20 text-xs border-gray-300 bg-white hover:bg-gray-50">
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
        )}
      </div>
    );
  }

  return (
    <Card className="mb-6 bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
      <CardHeader className="pb-3">
        <div
          className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
          onClick={toggleExpanded}
        >
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Transaction Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm">Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span className="text-sm">Show</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label
                htmlFor="type-filter"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <CreditCard className="h-4 w-4" />
                Transaction Type
              </Label>
              <Select
                value={tempFilters.type || 'all'}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger
                  id="type-filter"
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={TransactionType.PURCHASE}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Purchase
                    </div>
                  </SelectItem>
                  <SelectItem value={TransactionType.DEDUCTION}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Token Usage
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Gateway */}
            <div className="space-y-2">
              <Label
                htmlFor="gateway-filter"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <CreditCard className="h-4 w-4" />
                Payment Gateway
              </Label>
              <Select
                value={tempFilters.paymentGateway || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('paymentGateway', value)
                }
              >
                <SelectTrigger
                  id="gateway-filter"
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value={PaymentMethod.STRIPE}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                      Stripe
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentMethod.VNPAY}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
                      VNPay
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label
                htmlFor="status-filter"
                className="text-sm font-medium text-gray-700 flex items-center gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                Status
              </Label>
              <Select
                value={tempFilters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger
                  id="status-filter"
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SUCCEEDED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('SUCCEEDED')}
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value="INITIATED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('INITIATED')}
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="FAILED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('FAILED')}
                      Failed
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPIRED">
                    <div className="flex items-center gap-2">
                      {getStatusIcon('EXPIRED')}
                      Expired
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Records per page */}
            <div className="space-y-2">
              <Label
                htmlFor="limit"
                className="text-sm font-medium text-gray-700"
              >
                Records per page
              </Label>
              <Select
                value={tempFilters.limit?.toString() || '20'}
                onValueChange={(value) =>
                  handleFilterChange('limit', parseInt(value))
                }
              >
                <SelectTrigger
                  id="limit"
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 records</SelectItem>
                  <SelectItem value="20">20 records</SelectItem>
                  <SelectItem value="50">50 records</SelectItem>
                  <SelectItem value="100">100 records</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-3">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-1">
                <Label htmlFor="date-from" className="text-xs text-gray-600">
                  From Date
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={tempFilters.dateFrom || ''}
                  onChange={(e) =>
                    handleFilterChange('dateFrom', e.target.value)
                  }
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-to" className="text-xs text-gray-600">
                  To Date
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={tempFilters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="h-9 bg-white border-gray-300 hover:border-gray-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClearFilters}
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
