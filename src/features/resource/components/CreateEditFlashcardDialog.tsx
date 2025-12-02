import React, { useState, useEffect, useRef } from 'react';
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
import {
  Plus,
  Edit2,
  X,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useCreateFlashcardMutation,
  useUpdateFlashcardMutation,
  useGetCategoriesQuery,
  useTranslateTextMutation,
} from '../../flashcard/services/flashcardApi';
import { useLazyGetPhoneticsQuery } from '../../vocabulary/services/vocabularyApi';
import type {
  Flashcard,
  Category,
} from '../../flashcard/types/flashcard.types';
import { toast } from 'sonner';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface CreateEditFlashcardDialogProps {
  flashcard?: Flashcard;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  selectedText?: string;
  selectedTranslation?: string;
  resourceUrl?: string;
}

const CreateEditFlashcardDialog: React.FC<CreateEditFlashcardDialogProps> = ({
  flashcard,
  isEdit = false,
  trigger,
  onSuccess,
  open,
  onOpenChange,
  selectedText,
  selectedTranslation,
  resourceUrl,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const hasInitializedRef = useRef(false); // Track if we've initialized form
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    tags: [] as string[],
    source: '',
    phonetic: '',
    isAIGenerated: false,
  });
  const [newTag, setNewTag] = useState('');
  const [phonetics, setPhonetics] = useState<
    { text: string; audio?: string }[]
  >([]);
  const [showPhonetics, setShowPhonetics] = useState(false);
  const [phoneticsExpanded, setPhoneticsExpanded] = useState(false);

  const { speak } = useSpeechSynthesis();

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();

  const categories = categoriesResponse || [];
  const [createFlashcard, { isLoading: isCreating }] =
    useCreateFlashcardMutation();
  const [updateFlashcard, { isLoading: isUpdating }] =
    useUpdateFlashcardMutation();
  const [translateText, { isLoading: isTranslating }] =
    useTranslateTextMutation();
  const [fetchPhonetics, { isLoading: fetchingPhonetics }] =
    useLazyGetPhoneticsQuery();

  useEffect(() => {
    if (categoriesError) {
      toast.error('Failed to load categories. Please try again.');
    }
  }, [categoriesError]);

  // Initialize form only once when dialog opens
  useEffect(() => {
    if (!dialogOpen || hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    if (isEdit && flashcard) {
      setFormData({
        front: flashcard.front,
        back: flashcard.back,
        category: flashcard.category,
        difficulty: flashcard.difficulty,
        tags: flashcard.tags,
        source: flashcard.source || '',
        phonetic: flashcard.phonetic
          ? `/${flashcard.phonetic.replace(/^\/+|\/+$/g, '')}/`
          : '',
        isAIGenerated: flashcard.isAIGenerated,
      });
    } else {
      // Pre-fill with selected text and resource URL
      setFormData({
        front: selectedText || '',
        back: selectedTranslation || '',
        category: '',
        difficulty: 'Medium',
        tags: [],
        source: resourceUrl || '',
        phonetic: '',
        isAIGenerated: false,
      });
    }
  }, [
    dialogOpen,
    isEdit,
    flashcard,
    selectedText,
    selectedTranslation,
    resourceUrl,
  ]);

  // Reset the ref when dialog closes
  useEffect(() => {
    if (!dialogOpen) {
      hasInitializedRef.current = false;
    }
  }, [dialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error('Please fill in all required fields (Front, Back)');
      return;
    }

    // Clean phonetic data before sending to backend (remove slashes)
    const cleanFormData = {
      ...formData,
      phonetic: formData.phonetic
        ? formData.phonetic.replace(/^\/+|\/+$/g, '')
        : '',
    };

    try {
      if (isEdit && flashcard) {
        await updateFlashcard({
          id: flashcard._id || '',
          ...cleanFormData,
        }).unwrap();
        toast.success('Flashcard updated successfully');
        setDialogOpen(false);
        onSuccess?.();
      } else {
        await createFlashcard(cleanFormData).unwrap();
        toast.success('Flashcard created successfully');
        setDialogOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} flashcard`);
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

  const handleFetchPhonetics = async () => {
    const word = formData.front.trim();
    // Only fetch if it's a single word in English (no spaces, Vietnamese chars)
    if (
      !word ||
      word.includes(' ') ||
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        word
      )
    ) {
      setShowPhonetics(false);
      setPhoneticsExpanded(false);
      return;
    }

    try {
      const result = await fetchPhonetics(word).unwrap();
      if (result?.phonetics && result.phonetics.length > 0) {
        setPhonetics(result.phonetics);
        setShowPhonetics(true);
        setPhoneticsExpanded(true); // Auto-expand when results loaded
      } else {
        setShowPhonetics(false);
        setPhoneticsExpanded(false);
      }
    } catch (error) {
      setShowPhonetics(false);
      setPhoneticsExpanded(false);
    }
  };

  const insertPhonetic = (phoneticText: string) => {
    // Remove any existing slashes and add proper formatting
    const cleanText = phoneticText.replace(/^\/+|\/+$/g, '');
    setFormData((prev) => ({ ...prev, phonetic: `/${cleanText}/` }));
    toast.success('Phonetic added');
  };

  const playPronunciation = (audioUrl?: string, text?: string) => {
    if (audioUrl) {
      // Play audio from URL if available
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.warn('Failed to play audio from URL:', error);
        // Fallback to Web Speech API
        if (text) {
          speak(text, 'en-US');
        }
      });
    } else if (text) {
      // Fallback to Web Speech API
      speak(text, 'en-US');
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.front.trim()) {
      toast.error('Please enter the front side first');
      return;
    }

    try {
      const response = await translateText({
        sourceText: formData.front,
        destinationLanguage: 'vi',
      }).unwrap();

      const translation = response.data?.destinationText || '';
      if (translation) {
        setFormData((prev) => ({ ...prev, back: translation }));
        // toast.success('Text translated successfully');
      } else {
        toast.error('No translation available');
      }
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error('Failed to translate text. Please try again.');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing dialog
      if (!isEdit) {
        setFormData({
          front: selectedText || '',
          back: selectedTranslation || '',
          category: '',
          difficulty: 'Medium',
          tags: [],
          source: resourceUrl || '',
          phonetic: '',
          isAIGenerated: false,
        });
        setNewTag('');
        setShowPhonetics(false);
        setPhoneticsExpanded(false);
      }
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {!isControlled && (
        <div
          onClick={() => {
            if (!isEdit) {
              setFormData({
                front: selectedText || '',
                back: selectedTranslation || '',
                category: '',
                difficulty: 'Medium',
                tags: [],
                source: resourceUrl || '',
                phonetic: '',
                isAIGenerated: false,
              });
              setNewTag('');
              setShowPhonetics(false);
              setPhoneticsExpanded(false);
            }
            setDialogOpen(true);
          }}
        >
          {trigger || (
            <Button className="gap-2">
              {isEdit ? <Edit2 size={16} /> : <Plus size={16} />}
              {isEdit ? 'Edit Flashcard' : 'Create Flashcard'}
            </Button>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="scrollbar-hide max-w-lg max-h-[90vh] overflow-y-auto p-6">
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
                  Front Side *
                </Label>
                <Textarea
                  id="front"
                  placeholder="Enter the question or prompt..."
                  value={formData.front}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, front: e.target.value }));
                    setShowPhonetics(false);
                    setPhoneticsExpanded(false);
                  }}
                  onBlur={handleFetchPhonetics}
                  className="resize-none min-h-[100px]"
                  rows={4}
                  required
                />
                {fetchingPhonetics && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Fetching phonetics...
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="back" className="text-sm font-medium">
                    Back Side *
                  </Label>
                  {formData.front && !formData.back && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoTranslate}
                      disabled={isTranslating}
                      className="h-7 text-xs"
                    >
                      {isTranslating ? 'Translating...' : 'Auto Translate'}
                    </Button>
                  )}
                </div>
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

            {/* Phonetics Section - Collapsible to prevent layout shift */}
            <div className="col-span-1 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setPhoneticsExpanded(!phoneticsExpanded);
                  if (!phoneticsExpanded && !showPhonetics) {
                    handleFetchPhonetics();
                  }
                }}
                className="w-full justify-between"
                disabled={fetchingPhonetics}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {fetchingPhonetics
                    ? 'Fetching phonetics...'
                    : 'Phonetics Helper'}
                </span>
                {phoneticsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {phoneticsExpanded && showPhonetics && phonetics.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                  <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Click to add phonetic
                  </div>
                  <div className="space-y-1.5">
                    {phonetics.map((phonetic, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertPhonetic(phonetic.text)}
                        className="w-full flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900 rounded border border-blue-200 dark:border-blue-700 transition-colors text-left"
                      >
                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                          {phonetic.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              const phoneticWithAudio = phonetics.find(
                                (p) => p.audio
                              );
                              playPronunciation(
                                phoneticWithAudio?.audio,
                                formData.front
                              );
                            }}
                          >
                            <Volume2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category and Source in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading categories...
                      </SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        No categories available. Please create a category first.
                      </SelectItem>
                    ) : (
                      categories.map((category: Category) => {
                        return (
                          <SelectItem
                            key={category._id}
                            value={category._id || ''}
                          >
                            <span className="truncate block max-w-full">
                              {category.name}
                            </span>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
                {categories.length === 0 && !categoriesLoading && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ No categories found. Please create a category first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-sm font-medium">
                  Source (Optional)
                </Label>
                <Input
                  id="source"
                  placeholder="e.g. Resource URL, Textbook page 42"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, source: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Phonetic and Difficulty in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phonetic" className="text-sm font-medium">
                  Phonetic (Optional)
                </Label>
                <Input
                  id="phonetic"
                  placeholder="e.g. /həˈloʊ/"
                  value={formData.phonetic}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phonetic: e.target.value,
                    }))
                  }
                  className="font-mono"
                />
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
                onClick={() => setDialogOpen(false)}
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
