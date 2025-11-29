import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CustomPagination from '@/components/ui/custom-pagination';
import { PromoFilterCard } from '@/features/admin-promotion/components/PromoFilterCard';
import { PromoTable } from '@/features/admin-promotion/components/PromoTable';
import { PromoDialogForm } from '@/features/admin-promotion/components/PromoDialogForm';
import {
  getPromos,
  createPromo,
  updatePromo,
  deletePromo,
} from '@/features/admin-promotion/services/promoApi';
import type {
  PromoCode,
  PromoFilters,
  PromoFormData,
  PaginationInfo,
} from '@/features/admin-promotion/types/promo.types';
import { useConfirmationDialog } from '@/hooks/useConfirmationDialog';

export const AdminPromotionPage = () => {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmDialog } = useConfirmationDialog();

  const [filters, setFilters] = useState<PromoFilters>({
    search: '',
    sort: 'desc',
    active: '',
    minDiscount: '',
    maxDiscount: '',
    status: '',
    availability: '',
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const limit = filters.limit || 10;
      const res = await getPromos(page, limit, filters);
      setPromos(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      toast.error('Failed to load promotions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleSave = async (form: PromoFormData) => {
    try {
      const payload = {
        code: form.code,
        discount: Number(form.discount),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiration: form.expiration,
        active: !!form.active,
        maxUsesPerUser: form.maxUsesPerUser
          ? Number(form.maxUsesPerUser)
          : undefined,
        minOrderValue: form.minOrderValue
          ? Number(form.minOrderValue)
          : undefined,
        maxDiscountAmount: form.maxDiscountAmount
          ? Number(form.maxDiscountAmount)
          : undefined,
      };

      if (editingPromo) {
        await updatePromo(editingPromo._id!, payload);
        toast.success('Promotion updated successfully');
      } else {
        await createPromo(payload);
        toast.success('Promotion created successfully');
      }

      setOpenDialog(false);
      setEditingPromo(null);
      fetchPromos();
    } catch (error) {
      toast.error('Failed to save promotion');
      console.error(error);
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Promotion',
      description:
        'Are you sure you want to delete this promotion code? This action cannot be undone.',
      variant: 'destructive',
      onConfirm: async () => {
        try {
          await deletePromo(id);
          toast.success('Promotion deleted successfully');
          fetchPromos();
        } catch (error) {
          toast.error('Failed to delete promotion');
          console.error(error);
        }
      },
    });
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setEditingPromo(null);
    setOpenDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Promotion Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage discount codes and promotional campaigns
                </p>
              </div>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Create Promo
            </Button>
          </div>
        </div>
        <PromoFilterCard
          filters={filters}
          onFilter={(newFilters: PromoFilters) => {
            setFilters(newFilters);
            setPage(1);
          }}
        />{' '}
        <PromoTable
          promos={promos}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-8">
            <CustomPagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
        <PromoDialogForm
          open={openDialog}
          setOpen={setOpenDialog}
          editingPromo={editingPromo}
          onSave={handleSave}
        />
        {ConfirmDialog}
      </div>
    </div>
  );
};
