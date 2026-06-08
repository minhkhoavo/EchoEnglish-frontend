import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, FolderInput } from 'lucide-react';
import { useGetCategoriesQuery } from '../services/flashcardApi';
import type { Category } from '../types/flashcard.types';

interface BulkMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: (targetCategoryId: string) => Promise<void>;
}

export const BulkMoveDialog: React.FC<BulkMoveDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}) => {
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [isMoving, setIsMoving] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategoriesQuery();

  const handleConfirm = async () => {
    if (!targetCategory) return;

    setIsMoving(true);
    try {
      await onConfirm(targetCategory);
      setTargetCategory('');
      onOpenChange(false);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderInput className="h-5 w-5 text-blue-600" />
            Move Flashcards to Category
          </DialogTitle>
          <DialogDescription>
            Move {selectedCount} selected flashcard
            {selectedCount > 1 ? 's' : ''} to a different category.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-category">Target Category</Label>
            <Select
              value={targetCategory}
              onValueChange={setTargetCategory}
              disabled={categoriesLoading || isMoving}
            >
              <SelectTrigger id="target-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category: Category) => (
                    <SelectItem key={category._id} value={category._id || ''}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMoving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!targetCategory || isMoving}
          >
            {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Move {selectedCount} Flashcard{selectedCount > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
