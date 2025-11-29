import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import CustomPagination from '@/components/ui/custom-pagination';
import { PaymentFilterCard } from '@/features/admin-payment/components/PaymentFilterCard';
import { PaymentTable } from '@/features/admin-payment/components/PaymentTable';
import { PaymentStatsOverview } from '@/features/admin-payment/components/PaymentStatsOverview';
import {
  getPayments,
  calculatePaymentStats,
} from '@/features/admin-payment/services/paymentApi';
import type {
  Payment,
  PaymentFilters,
  PaginationInfo,
} from '@/features/admin-payment/types/payment.types';

export const AdminPaymentPage = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => calculatePaymentStats(data), [data]);

  const fetchPayments = async (currentPage = 1, currentFilters = {}) => {
    setLoading(true);
    try {
      const limit = (currentFilters as PaymentFilters).limit || 10;
      const res = await getPayments(currentPage, limit, currentFilters);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, filters);
  }, [page, filters]);

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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-2 text-gray-500">Loading payments...</p>
          </div>
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
