import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Palette, FolderPlus } from 'lucide-react';
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../services/flashcardApi';
import type { Category } from '../types/flashcard.types';
import { useToast } from '@/hooks/use-toast';

interface CreateEditCategoryDialogProps {
  category?: Category;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const categoryColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6B7280', // gray
  '#14B8A6', // teal
  '#A855F7', // purple
];

// Mapping from Tailwind classes to hex colors
const tailwindToHexMap: { [key: string]: string } = {
  'bg-blue-500': '#3B82F6',
  'bg-green-500': '#10B981',
  'bg-purple-500': '#8B5CF6',
  'bg-orange-500': '#F97316',
  'bg-red-500': '#EF4444',
  'bg-yellow-500': '#F59E0B',
  'bg-pink-500': '#EC4899',
  'bg-indigo-500': '#6366F1',
  'bg-cyan-500': '#06B6D4',
  'bg-lime-500': '#84CC16',
  'bg-gray-500': '#6B7280',
  'bg-teal-500': '#14B8A6',
};

// Reverse mapping from hex to Tailwind classes
const hexToTailwindMap: { [key: string]: string } = Object.fromEntries(
  Object.entries(tailwindToHexMap).map(([key, value]) => [value, key])
);

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
    color: categoryColors[0],
    icon: '',
  });

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (isEdit && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        color: tailwindToHexMap[category.color] || category.color,
        icon: category.icon || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: categoryColors[0],
        icon: '',
      });
    }
  }, [isEdit, category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEdit && category) {
        await updateCategory({
          id: category.id,
          name: formData.name,
          description: formData.description,
          color: hexToTailwindMap[formData.color] || formData.color,
          icon: formData.icon,
        }).unwrap();
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description,
          color: hexToTailwindMap[formData.color] || formData.color,
          icon: formData.icon,
        }).unwrap();
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}>
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

      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          // Reset form when dialog closes
          if (!isEdit) {
            setFormData({
              name: '',
              description: '',
              color: categoryColors[0],
              icon: '',
            });
          }
        }
      }}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-4">
            <DialogTitle>
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description for this category"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="resize-none"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Optional)</Label>
            <Input
              id="icon"
              placeholder="Icon name or emoji (e.g., 📚, book, etc.)"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
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
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
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

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateEditCategoryDialog;
