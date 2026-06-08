import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, FolderPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetCategoriesQuery } from '@/features/flashcard/services/flashcardApi';
import type { Category } from '@/features/flashcard/types/flashcard.types';

interface CategorySelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (categoryId?: string) => void;
  isLoading?: boolean;
  wordName?: string;
}

export function CategorySelectDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  wordName,
}: CategorySelectDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const { data: categories = [] } = useGetCategoriesQuery();

  useEffect(() => {
    if (categories.length > 0) {
      const firstCategory = categories.find(
        (cat) => cat._id && cat._id.trim() !== ''
      );
      if (firstCategory && firstCategory._id) {
        setSelectedCategory(firstCategory._id);
      }
    } else {
      setSelectedCategory('default');
    }
  }, [categories]);

  const handleConfirm = () => {
    // Convert 'default' back to undefined for API call
    const categoryId =
      selectedCategory === 'default' ? undefined : selectedCategory;
    onConfirm(categoryId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Select Category
          </DialogTitle>
          <DialogDescription>
            {wordName
              ? `Choose a category for "${wordName}"`
              : 'Choose a category for this word'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category (Optional)</label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 && (
                  <SelectItem value="default">
                    <span className="text-muted-foreground">Uncategorized</span>
                  </SelectItem>
                )}
                {categories
                  .filter((cat): cat is Category & { _id: string } =>
                    Boolean(cat._id && cat._id.trim() !== '')
                  )
                  .map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You can organize flashcards by categories for better management
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Import Word
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
