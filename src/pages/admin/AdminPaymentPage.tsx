import { useState, useMemo } from 'react';
import CustomPagination from '@/components/CustomPagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PaymentFilterCard } from '@/features/admin-payment/components/PaymentFilterCard';
import { PaymentTable } from '@/features/admin-payment/components/PaymentTable';
import { PaymentStatsOverview } from '@/features/admin-payment/components/PaymentStatsOverview';
import {
  useGetPaymentsQuery,
  calculatePaymentStats,
} from '@/features/admin-payment/services/paymentApi';
import type { PaymentFilters } from '@/features/admin-payment/types/payment.types';

export const AdminPaymentPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFilters>({});

  const { data: response, isLoading } = useGetPaymentsQuery({
    page,
    limit: filters.limit || 10,
    ...filters,
  });

  const data = useMemo(() => response?.data.data || [], [response]);
  const pagination = response?.data.pagination;

  const stats = useMemo(() => calculatePaymentStats(data), [data]);

  const handleFilterChange = (newFilters: PaymentFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Payment Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage transactions and payment records
              </p>
            </div>
          </div>
        </div>

        <PaymentStatsOverview stats={stats} />

        <PaymentFilterCard filters={filters} onFilter={handleFilterChange} />

        {isLoading ? (
          <LoadingSpinner message="Loading payments..." />
        ) : (
          <PaymentTable data={data} />
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <CustomPagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
