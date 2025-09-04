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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, X, Hash } from 'lucide-react';
import {
  useCreateFlashcardMutation,
  useUpdateFlashcardMutation,
  useGetCategoriesQuery,
} from '../services/flashcardApi';
import type { Flashcard, Category } from '../types/flashcard.types';
import { useToast } from '@/hooks/use-toast';

interface CreateEditFlashcardDialogProps {
  flashcard?: Flashcard;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const CreateEditFlashcardDialog: React.FC<CreateEditFlashcardDialogProps> = ({
  flashcard,
  isEdit = false,
  trigger,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    tags: [] as string[],
    source: '',
    isAIGenerated: false,
  });
  const [newTag, setNewTag] = useState('');

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const [createFlashcard, { isLoading: isCreating }] =
    useCreateFlashcardMutation();
  const [updateFlashcard, { isLoading: isUpdating }] =
    useUpdateFlashcardMutation();
  const { toast } = useToast();

  useEffect(() => {
    if (isEdit && flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
        category: flashcard.category,
        difficulty: flashcard.difficulty,
        tags: flashcard.tags,
        source: flashcard.source || '',
        isAIGenerated: flashcard.isAIGenerated,
      });
      setOpen(true); // Auto open when editing
    } else {
      setFormData({
        front: '',
        back: '',
        category: '',
        difficulty: 'Medium',
        tags: [],
        source: '',
        isAIGenerated: false,
      });
    }
  }, [isEdit, flashcard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim() || !formData.category) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in all required fields (Front, Back, Category)',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEdit && flashcard) {
        await updateFlashcard({
          id: flashcard.id,
          ...formData,
        }).unwrap();
        toast({
          title: 'Success',
          description: 'Flashcard updated successfully',
        });
      } else {
        await createFlashcard(formData).unwrap();
        toast({
          title: 'Success',
          description: 'Flashcard created successfully',
        });
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} flashcard`,
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <Button className="gap-2">
            {isEdit ? <Edit2 size={16} /> : <Plus size={16} />}
            {isEdit ? 'Edit Flashcard' : 'Create Flashcard'}
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen && isEdit) {
            onSuccess?.(); // Call onSuccess when closing edit dialog
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Flashcard' : 'Create New Flashcard'}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              {isEdit
                ? 'Update your flashcard details below.'
                : 'Add a new flashcard to your collection. Fill in the details below.'}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Front and Back Side in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="front" className="text-sm font-medium">
                  Front Side
                </Label>
                <Textarea
                  id="front"
                  placeholder="Enter the question or prompt..."
                  value={formData.front}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, front: e.target.value }))
                  }
                  className="resize-none min-h-[100px]"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="back" className="text-sm font-medium">
                  Back Side
                </Label>
                <Textarea
                  id="back"
                  placeholder="Enter the answer or explanation..."
                  value={formData.back}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, back: e.target.value }))
                  }
                  className="resize-none min-h-[100px]"
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Category and Source in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">
                  Source (Optional)
                </Label>
                <Input
                  id="source"
                  placeholder="e.g. Textbook page 42, Wikipedia"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, source: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'Easy' | 'Medium' | 'Hard') =>
                  setFormData((prev) => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  className="px-3"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {formData.tags.length}/10 tags added
              </p>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 px-2 py-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t">
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
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus size={16} />
                    {isEdit ? 'Update Flashcard' : 'Create Flashcard'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateEditFlashcardDialog;
