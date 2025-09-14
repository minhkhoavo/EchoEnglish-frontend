import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Palette, FolderPlus } from 'lucide-react';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../services/flashcardApi';
import type { Category } from '../types/flashcard.types';
import { useToast } from '@/hooks/use-toast';

interface CreateEditCategoryDialogProps {
  category?: Category;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const categoryColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6B7280',
  '#14B8A6',
  '#A855F7',
];
const categoryIcons = [
  '📚',
  '🎓',
  '💡',
  '🔬',
  '🧮',
  '🎨',
  '🎵',
  '⚽',
  '🏃',
  '✈️',
  '🌍',
  '💼',
  '🧠',
  '📝',
  '🎯',
  '🏆',
  '🔥',
  '⭐',
  '🌟',
  '💎',
  '🎪',
  '🎭',
  '🎪',
  '🏛️',
];

const CreateEditCategoryDialog: React.FC<CreateEditCategoryDialogProps> = ({
  category,
  isEdit = false,
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6',
        icon: category.icon || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '',
      });
    }
  }, [isEdit, category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEdit && category) {
        await updateCategory({
          id: category._id || '',
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        }).unwrap();
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        }).unwrap();
        toast({
          title: 'Success',
          description: 'Category created successfully',
        });
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} category`,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          {isEdit ? <Edit2 size={16} /> : <FolderPlus size={16} />}
          {isEdit ? 'Edit Category' : 'New Category'}
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            // Reset form when dialog closes
            if (!isEdit) {
              setFormData({
                name: '',
                description: '',
                color: '#3B82F6',
                icon: '',
              });
            }
          }
        }}
      >
        {/* Ensure DialogContent uses full width and box-sizing so children sizes are constrained */}
        <DialogContent className="scrollbar-hide max-w-md w-full box-border max-h-[94vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description for this category"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="icon">Icon (Optional)</Label>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-thin min-w-0">
                {categoryIcons.slice(0, 20).map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all hover:scale-110 flex-shrink-0 min-w-0 ${
                      formData.icon === icon
                        ? 'border-blue-500 bg-blue-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <Input
                id="icon"
                placeholder="Or enter custom icon/emoji (e.g., 📚, book, etc.)"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, icon: e.target.value }))
                }
                className="min-w-0"
              />
              {formData.icon && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">Preview:</span>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg border"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.icon}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 min-w-0">
              <Label className="flex items-center gap-2">
                <Palette size={16} />
                Color
              </Label>
              <div className="grid grid-cols-6 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600">Selected color:</span>
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="text-sm font-mono">{formData.color}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 min-w-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 min-w-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 min-w-0"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? 'Saving...'
                  : isEdit
                    ? 'Update'
                    : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateEditCategoryDialog;
