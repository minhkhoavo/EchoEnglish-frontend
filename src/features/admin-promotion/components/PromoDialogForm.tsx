import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from 'lucide-react';
import type { PromoCode, PromoFormData } from '../types/promo.types';

interface PromoDialogFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editingPromo: PromoCode | null;
  onSave: (data: PromoFormData) => void;
}

export const PromoDialogForm = ({
  open,
  setOpen,
  editingPromo,
  onSave,
}: PromoDialogFormProps) => {
  const [form, setForm] = useState<PromoFormData>({
    code: '',
    discount: 0,
    usageLimit: 1,
    expiration: '',
    active: true,
    maxUsesPerUser: undefined,
    minOrderValue: undefined,
    maxDiscountAmount: undefined,
  });

  useEffect(() => {
    if (editingPromo) {
      setForm({
        code: editingPromo.code,
        discount: editingPromo.discount,
        usageLimit: editingPromo.usageLimit,
        expiration: editingPromo.expiration
          ? editingPromo.expiration.split('T')[0]
          : '',
        active: editingPromo.active,
        maxUsesPerUser: editingPromo.maxUsesPerUser,
        minOrderValue: editingPromo.minOrderValue,
        maxDiscountAmount: editingPromo.maxDiscountAmount,
      });
    } else {
      setForm({
        code: '',
        discount: 0,
        usageLimit: 1,
        expiration: '',
        active: true,
        maxUsesPerUser: undefined,
        minOrderValue: undefined,
        maxDiscountAmount: undefined,
      });
    }
  }, [editingPromo, open]);

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingPromo ? 'Update Promotion' : 'Create New Promotion'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Code */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Promo Code *</Label>
            <Input
              placeholder="e.g. SUMMER2024"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              disabled={!!editingPromo}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Discount */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Discount (%) *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) })
                }
              />
            </div>

            {/* Usage Limit */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Usage Limit</Label>
              <Input
                type="number"
                min="1"
                value={form.usageLimit || ''}
                onChange={(e) =>
                  setForm({ ...form, usageLimit: Number(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Expiration Date */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Expiration Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                className="pl-9"
                value={form.expiration}
                onChange={(e) =>
                  setForm({ ...form, expiration: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Uses Per User */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Max Uses Per User</Label>
              <Input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={form.maxUsesPerUser || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxUsesPerUser: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            {/* Min Order Value */}
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Min Order Value (VND)</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.minOrderValue || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minOrderValue: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Max Discount Amount */}
          <div className="flex flex-col gap-2">
            <Label className="font-medium">Max Discount Amount (VND)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Unlimited"
              value={form.maxDiscountAmount || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxDiscountAmount: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2">
            <Label className="font-medium">Active Status</Label>
            <Switch
              checked={form.active}
              onCheckedChange={(checked: boolean) =>
                setForm({ ...form, active: checked })
              }
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingPromo ? 'Save Changes' : 'Create Promotion'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
