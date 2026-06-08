import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import type { PromoCode } from '../types/promo.types';

interface PromoTableProps {
  promos: PromoCode[];
  loading: boolean;
  onEdit: (promo: PromoCode) => void;
  onDelete: (id: string) => void;
}

export const PromoTable = ({
  promos,
  loading,
  onEdit,
  onDelete,
}: PromoTableProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="shadow-md border border-gray-200 bg-white rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Code</th>
              <th className="p-3 text-left font-semibold">Discount</th>
              <th className="p-3 text-left font-semibold">Used / Limit</th>
              <th className="p-3 text-left font-semibold">Expiration</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : promos.length > 0 ? (
              promos.map((promo) => {
                const expired = isExpired(promo.expiration);
                const outOfStock = promo.usageLimit
                  ? (promo.usedCount || 0) >= promo.usageLimit
                  : false;

                return (
                  <tr
                    key={promo._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-mono font-semibold text-blue-600">
                      {promo.code}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{promo.discount}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">
                        {promo.usedCount || 0}
                      </span>
                      {' / '}
                      <span className="text-gray-500">
                        {promo.usageLimit || '∞'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={expired ? 'text-red-600' : ''}>
                          {formatDate(promo.expiration)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {promo.active ? (
                          <Badge className="bg-green-100 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            Inactive
                          </Badge>
                        )}
                        {expired && (
                          <Badge className="bg-red-100 text-red-700">
                            Expired
                          </Badge>
                        )}
                        {outOfStock && (
                          <Badge className="bg-orange-100 text-orange-700">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(promo)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <ConfirmationDialog
                          title="Delete Promotion"
                          description="Are you sure you want to delete this promotion code? This action cannot be undone."
                          variant="destructive"
                          onConfirm={() => onDelete(promo._id!)}
                        >
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </ConfirmationDialog>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-6 text-gray-500 italic"
                >
                  No promotions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
