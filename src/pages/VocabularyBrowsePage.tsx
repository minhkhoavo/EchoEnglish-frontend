import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Search,
  Plus,
  Volume2,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Zap,
  PackagePlus,
  CheckSquare,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '@/components/CustomPagination';
import {
  useGetVocabularySetsQuery,
  useGetWordsBySetQuery,
  useLazySearchVocabularyQuery,
  useImportToFlashcardMutation,
} from '../features/vocabulary/services/vocabularyApi';
import { useGetFlashcardsQuery } from '@/features/flashcard/services/flashcardApi';
import { useGetCategoriesQuery } from '@/features/flashcard/services/flashcardApi';
import type {
  VocabularySet,
  VocabularyWord,
} from '../features/vocabulary/types/vocabulary.types';
import { BulkImportDialog } from '../features/vocabulary/components/BulkImportDialog';
import { CategorySelectDialog } from '../features/vocabulary/components/CategorySelectDialog';
import { VocabularyCard } from '../features/vocabulary/components/VocabularyCard';

export default function VocabularyBrowsePage() {
  const [selectedSet, setSelectedSet] = useState<VocabularySet | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [filterImported, setFilterImported] = useState<
    'all' | 'imported' | 'not-imported'
  >('all');
  const navigate = useNavigate();

  const PAGE_SIZE = 12;

  // RTK Query hooks
  const { data: sets = [], isLoading: setsLoading } =
    useGetVocabularySetsQuery();
  const { data: wordsData, isLoading: wordsLoading } = useGetWordsBySetQuery(
    {
      fileName: selectedSet?.fileName || '',
      page: currentPage,
      limit: PAGE_SIZE,
      importStatus: filterImported,
    },
    { skip: !selectedSet || searchMode }
  );
  const [searchVocabulary, { data: searchResults, isLoading: searchLoading }] =
    useLazySearchVocabularyQuery();
  const [importToFlashcard] = useImportToFlashcardMutation();
  const { data: allFlashcards = [], refetch: refetchFlashcards } =
    useGetFlashcardsQuery();
  const { refetch: refetchCategories } = useGetCategoriesQuery();
  const [importingCards, setImportingCards] = useState<Set<string>>(new Set());
  const [importedCards, setImportedCards] = useState<Set<string>>(new Set());

  const words = searchMode ? searchResults || [] : wordsData?.words || [];

  // Extract imported card IDs from flashcards' source field
  useEffect(() => {
    const imported = new Set<string>();
    allFlashcards.forEach((flashcard) => {
      if (flashcard.source) {
        // Extract card_id from source format: "Vocabulary Library - Family (68f47d069a4e8dd8355a1c62)"
        const match = flashcard.source.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          imported.add(match[1]);
        }
      }
    });
    setImportedCards(imported);
  }, [allFlashcards]);

  const totalPages = searchMode ? 1 : wordsData?.pagination?.totalPages || 1;
  const totalWords = searchMode
    ? searchResults?.length || 0
    : wordsData?.pagination?.totalWords || 0;
  const loading = setsLoading || wordsLoading || searchLoading;

  const handleImportClick = (word: VocabularyWord) => {
    setSelectedWord(word);
    setCategoryDialogOpen(true);
  };

  const handleImportConfirm = async (categoryId?: string) => {
    if (!selectedWord) return;

    setImportingCards((prev) => new Set(prev).add(selectedWord.card_id));
    setCategoryDialogOpen(false);

    const result = await importToFlashcard({
      cardId: selectedWord.card_id,
      categoryId,
    });

    if ('error' in result) {
      const error = result.error as {
        status?: number;
        data?: {
          message?: string;
          data?: { alreadyImported?: boolean };
        };
      };

      // Handle 409 Conflict (already imported)
      if (error.status === 409) {
        setImportedCards((prev) => new Set(prev).add(selectedWord.card_id));
        toast.info(
          error.data?.message ||
            `"${selectedWord.word}" is already in your flashcards`
        );
      } else {
        // Handle other errors
        const errorMessage =
          error.data?.message || `Failed to import "${selectedWord.word}"`;
        toast.error(errorMessage);
      }
    } else {
      // Success (201 Created) - newly imported
      setImportedCards((prev) => new Set(prev).add(selectedWord.card_id));
      toast.success(
        result.data.message ||
          `"${selectedWord.word}" has been added to your flashcards`
      );
    }

    setImportingCards((prev) => {
      const next = new Set(prev);
      next.delete(selectedWord.card_id);
      return next;
    });

    setSelectedWord(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchMode(false);
      setCurrentPage(1);
      return;
    }

    setSearchMode(true);
    searchVocabulary({
      query: searchQuery,
      fileName: selectedSet?.fileName,
    });
  };

  // Reset search mode when changing set
  useEffect(() => {
    setSearchMode(false);
    setSearchQuery('');
    setCurrentPage(1);
    setFilterImported('all');
  }, [selectedSet]);

  if (!selectedSet) {
    return (
      <div className="h-full bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto p-6 max-w-7xl">
          {/* Hero Section */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-3 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  Vocabulary Library
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Choose a vocabulary set to start learning and import words to
                  your flashcards
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">
                    Browse → Import → Review → Master
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate('/flashcards?tab=review')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Review
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(PAGE_SIZE)].map((_, i) => (
                <Card
                  key={i}
                  className="rounded-xl h-80 bg-slate-200 dark:bg-slate-800 animate-pulse border-slate-200 dark:border-slate-700 flex flex-col"
                >
                  <div className="bg-slate-300 dark:bg-slate-700 rounded-t-xl h-20"></div>
                  <div className="p-4 flex-1 flex flex-col space-y-4">
                    <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
                      <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>
                    </div>
                    <div className="h-11 bg-slate-300 dark:bg-slate-700 rounded mt-auto"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => (
                <Card
                  key={set.fileName}
                  className="rounded-xl cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700 group"
                  onClick={() => {
                    setSelectedSet(set);
                    setCurrentPage(1);
                  }}
                >
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <BookOpen className="h-5 w-5" />
                      {set.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {set.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="secondary"
                        className="text-sm font-semibold"
                      >
                        {set.wordCount} words
                      </Badge>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <span className="text-sm font-medium">Browse</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-xl p-6 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSet(null);
                  setSearchQuery('');
                }}
                className="border-2"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Library
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  {selectedSet.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalWords} words{' '}
                  {filterImported === 'all'
                    ? 'available'
                    : filterImported === 'imported'
                      ? 'imported'
                      : 'not imported yet'}{' '}
                  • Import individually or in bulk
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setBulkImportOpen(true)}
                className="border-2 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                disabled={words.length === 0}
              >
                <PackagePlus className="h-5 w-5 mr-2" />
                Bulk Import
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/flashcards?tab=review')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Zap className="h-5 w-5 mr-2" />
                Review Now
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-12 text-base border-2"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Filter:
            </span>
            <Button
              variant={filterImported === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilterImported('all');
                setCurrentPage(1);
              }}
              className="h-9"
            >
              All
            </Button>
            <Button
              variant={
                filterImported === 'not-imported' ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => {
                setFilterImported('not-imported');
                setCurrentPage(1);
              }}
              className="h-9"
            >
              Not Imported
            </Button>
            <Button
              variant={filterImported === 'imported' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilterImported('imported');
                setCurrentPage(1);
              }}
              className="h-9"
            >
              <Check className="h-4 w-4 mr-1" />
              Imported
            </Button>
          </div>
        </div>

        {/* Words Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <Card
                key={i}
                className="rounded-xl h-80 bg-slate-200 dark:bg-slate-800 animate-pulse border-slate-200 dark:border-slate-700"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {words.map((word) => (
                <VocabularyCard
                  key={word.card_id}
                  word={word}
                  isImported={importedCards.has(word.card_id)}
                  isImporting={importingCards.has(word.card_id)}
                  onImportClick={handleImportClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        selectedSet={selectedSet}
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onSuccess={() => {
          // Refresh flashcards and categories to update imported cards state and category counts
          refetchFlashcards();
          refetchCategories();
        }}
      />

      {/* Category Select Dialog for Single Import */}
      <CategorySelectDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onConfirm={handleImportConfirm}
        isLoading={
          selectedWord ? importingCards.has(selectedWord.card_id) : false
        }
        wordName={selectedWord?.word}
      />
    </div>
  );
}
