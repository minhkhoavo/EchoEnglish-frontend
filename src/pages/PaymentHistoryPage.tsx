import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { PaymentHistoryTable } from '../features/payment/components/PaymentHistoryTable';
import { TransactionFiltersComponent } from '../features/payment/components/TransactionFilters';
import { useGetTransactionHistoryQuery } from '../features/payment/services/paymentApi';
import type {
  TransactionFilters,
  Transaction,
} from '../features/payment/types';
import {
  History,
  RefreshCw,
  Download,
  AlertCircle,
  DollarSign,
  Plus,
  Minus,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
  });

  // API call
  const {
    data: transactionData,
    error,
    isLoading,
    refetch,
  } = useGetTransactionHistoryQuery(filters);

  const transactions = transactionData?.data?.transaction || [];

  // Handle filter changes
  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset page when filters change
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle payment continuation
  const handlePaymentContinue = (transaction: Transaction) => {
    if (transaction.payUrl) {
      window.open(transaction.payUrl, '_blank');
    }
  };

  // Export to CSV (basic implementation)
  const handleExportCSV = () => {
    if (!transactions.length) return;

    const csvContent = [
      [
        'Thời gian',
        'Mã GD',
        'Loại',
        'Số tiền',
        'Credit',
        'Mô tả',
        'Trạng thái',
        'Cổng TT',
      ].join(','),
      ...transactions.map((t) =>
        [
          new Date(t.createdAt).toLocaleString('vi-VN'),
          t._id,
          t.type === 'purchase' ? 'Mua credit' : 'Sử dụng credit',
          t.amount.toString(),
          t.tokens.toString(),
          `"${t.description.replace(/"/g, '""')}"`,
          t.status,
          t.paymentGateway,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `payment-history-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get summary statistics
  const getSummaryStats = () => {
    if (!transactions.length) return null;

    const purchaseTransactions = transactions.filter(
      (t) => t.type === 'purchase'
    );
    const successfulPurchases = purchaseTransactions.filter(
      (t) => t.status === 'SUCCEEDED'
    );

    const totalSpent = successfulPurchases.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    const totalCreditsEarned = successfulPurchases.reduce(
      (sum, t) => sum + t.tokens,
      0
    );
    const totalCreditsUsed = transactions
      .filter((t) => t.type === 'deduction' && t.status === 'SUCCEEDED')
      .reduce((sum, t) => sum + t.tokens, 0);

    return {
      totalSpent,
      totalCreditsEarned,
      totalCreditsUsed,
      successfulPurchases: successfulPurchases.length,
      totalTransactions: transactions.length,
    };
  };

  const stats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Transaction History
                </h1>
                <p className="text-gray-600 mt-1">
                  Track all your credit purchases and usage
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              {transactions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">
                    Total Spent
                  </p>
                  <DollarSign className="h-3 w-3 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(stats.totalSpent)}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">
                    Credits Purchased
                  </p>
                  <Plus className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-600">
                  +{stats.totalCreditsEarned.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">
                    Credits Used
                  </p>
                  <Minus className="h-3 w-3 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-orange-600">
                  -{stats.totalCreditsUsed.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">
                    Successful
                  </p>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div className="text-lg font-bold text-green-600">
                  {stats.successfulPurchases}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600">
                    Total Transactions
                  </p>
                  <BarChart3 className="h-3 w-3 text-purple-600" />
                </div>
                <div className="text-lg font-bold text-gray-800">
                  {stats.totalTransactions}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-lg"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-red-800">
              An error occurred while loading data. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <TransactionFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Transaction Table */}
        <PaymentHistoryTable
          transactions={transactions}
          isLoading={isLoading}
          error={error ? 'Cannot load transaction data' : null}
          onPaymentContinue={handlePaymentContinue}
        />

        {/* Pagination */}
        {transactions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardContent className="py-4">
              <div className="flex justify-center">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    disabled={!filters.page || filters.page <= 1}
                    className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
                  >
                    ← Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                      Page {filters.page || 1}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    disabled={transactions.length < (filters.limit || 20)}
                    className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
