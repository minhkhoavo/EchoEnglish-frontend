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
import { UserPaymentStats } from '../features/payment/components/UserPaymentStats';
import { useGetTransactionHistoryQuery } from '../features/payment/services/paymentApi';
import CustomPagination from '../components/ui/custom-pagination';
import type {
  TransactionFilters,
  Transaction,
} from '../features/payment/types';
import { History, RefreshCw, Download, AlertCircle } from 'lucide-react';

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
  const pagination = transactionData?.data?.pagination;

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

    // Format date consistently
    const formatDateForExport = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      } catch {
        return '';
      }
    };

    // Format currency consistently
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN').format(amount);
    };

    // Create CSV content with BOM for Vietnamese characters
    const BOM = '\uFEFF';
    const headers = [
      'Time',
      'Transaction ID',
      'Type',
      'Amount (VND)',
      'Credit',
      'Description',
      'Status',
      'Gateway',
      'Expiry',
    ];

    const rows = transactions.map((t) => [
      formatDateForExport(t.createdAt),
      t._id,
      t.type === 'purchase' ? 'Purchase' : 'Usage',
      t.amount > 0 ? formatCurrency(t.amount) : '-',
      `${t.type === 'purchase' ? '+' : '-'}${t.tokens}`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.status,
      t.paymentGateway,
      t.expiredAt ? formatDateForExport(t.expiredAt) : '-',
    ]);

    const csvContent =
      BOM + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history_${dateStr}_${timeStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get summary statistics for UserPaymentStats
  const stats = {
    totalSpent: transactions
      .filter((t) => t.type === 'purchase' && t.status === 'SUCCEEDED')
      .reduce((sum, t) => sum + t.amount, 0),
    totalCreditsEarned: transactions
      .filter((t) => t.type === 'purchase' && t.status === 'SUCCEEDED')
      .reduce((sum, t) => sum + t.tokens, 0),
    totalCreditsUsed: transactions
      .filter((t) => t.type === 'deduction' && t.status === 'SUCCEEDED')
      .reduce((sum, t) => sum + t.tokens, 0),
    successfulPurchases: transactions.filter(
      (t) => t.type === 'purchase' && t.status === 'SUCCEEDED'
    ).length,
    totalTransactions: transactions.length,
  };

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
        <UserPaymentStats stats={stats} />

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
        {transactions.length > 0 && pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <CustomPagination
              currentPage={filters.page || 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
