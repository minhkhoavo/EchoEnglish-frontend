import { useState, useEffect } from 'react';
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
import { Loader2, PackagePlus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useBulkImportToFlashcardsMutation } from '../services/vocabularyApi';
import { useGetCategoriesQuery } from '@/features/flashcard/services/flashcardApi';
import type { VocabularySet } from '../types/vocabulary.types';
import type { Category } from '@/features/flashcard/types/flashcard.types';

interface BulkImportDialogProps {
  selectedSet: VocabularySet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkImportDialog({
  selectedSet,
  open,
  onOpenChange,
  onSuccess,
}: BulkImportDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('default');
  const [bulkImport, { isLoading }] = useBulkImportToFlashcardsMutation();
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

  // Debug: log when dialog opens
  console.log('BulkImportDialog props:', {
    open,
    selectedSet: selectedSet
      ? {
          name: selectedSet.name,
          fileName: selectedSet.fileName,
          wordCount: selectedSet.wordCount,
        }
      : null,
  });

  const handleImport = async () => {
    if (!selectedSet) {
      console.error('handleImport called but selectedSet is null!');
      toast.error('No vocabulary set selected');
      return;
    }

    try {
      const response = await bulkImport({
        fileName: selectedSet.fileName,
        categoryId:
          selectedCategory === 'default' ? undefined : selectedCategory,
      }).unwrap();

      toast.success(
        response.message ||
          `Imported ${response.data.imported} words${response.data.skipped > 0 ? ` (${response.data.skipped} already existed)` : ''}`
      );

      setSelectedCategory('default');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || 'Failed to import words');
    }
  };

  // Don't render dialog content if no set selected
  if (!selectedSet) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Import Entire Vocabulary Set
          </DialogTitle>
          <DialogDescription>
            Import all words from "{selectedSet.name}" to your flashcards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This will import{' '}
              <strong>all {selectedSet.wordCount} words</strong> from this
              vocabulary set. Words that already exist in your flashcards will
              be automatically skipped.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category <span className="text-muted-foreground">(Optional)</span>
            </label>
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
              All imported words will be organized in the selected category
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
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4 mr-2" />
                Import All Words
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
