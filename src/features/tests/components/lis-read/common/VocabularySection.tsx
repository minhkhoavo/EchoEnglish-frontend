import { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  BookmarkCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useGetFlashcardsQuery,
  useCreateFlashcardMutation,
} from '@/features/flashcard/services/flashcardApi';

interface VocabWord {
  word: string;
  partOfSpeech?: string;
  meaning?: string;
  example?: string;
}

interface VocabularySectionProps {
  words: VocabWord[];
}

export const VocabularySection = ({ words }: VocabularySectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const { data: flashcards } = useGetFlashcardsQuery();
  const [createFlashcard] = useCreateFlashcardMutation();

  if (!words || words.length === 0) return null;

  const existingWords = new Set(
    (flashcards || []).map((f) => f.front.toLowerCase())
  );

  const isInFlashcard = (word: string) =>
    existingWords.has(word.toLowerCase()) || added.has(word.toLowerCase());

  const handleAdd = async (w: VocabWord) => {
    if (isInFlashcard(w.word)) return;
    try {
      await createFlashcard({
        front: w.word,
        back: w.meaning || '',
        category: '',
        difficulty: 'Medium',
        tags: ['vocabulary', 'toeic-review'],
        source: 'test-review',
        isAIGenerated: false,
      }).unwrap();
      setAdded((prev) => new Set(prev).add(w.word.toLowerCase()));
      toast.success(`Added "${w.word}" to flashcards`);
    } catch {
      toast.error(`Failed to add "${w.word}" to flashcards`);
    }
  };

  const handleAddAll = async () => {
    const toAdd = words.filter((w) => !isInFlashcard(w.word));
    if (toAdd.length === 0) return;
    let count = 0;
    for (const w of toAdd) {
      try {
        await createFlashcard({
          front: w.word,
          back: w.meaning || '',
          category: '',
          difficulty: 'Medium',
          tags: ['vocabulary', 'toeic-review'],
          source: 'test-review',
          isAIGenerated: false,
        }).unwrap();
        setAdded((prev) => new Set(prev).add(w.word.toLowerCase()));
        count++;
      } catch {
        // continue adding the rest
      }
    }
    if (count > 0)
      toast.success(`Added ${count} word${count > 1 ? 's' : ''} to flashcards`);
  };

  const allAdded = words.every((w) => isInFlashcard(w.word));

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary ({words.length})
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2">
          <CardContent className="p-4 space-y-3">
            {/* Add-all row */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Save words to your flashcard deck.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={allAdded}
                onClick={handleAddAll}
                className="h-7 text-xs gap-1.5"
              >
                {allAdded ? (
                  <BookmarkCheck className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <BookmarkPlus className="h-3.5 w-3.5" />
                )}
                {allAdded ? 'All saved' : 'Add all'}
              </Button>
            </div>

            {/* Word list */}
            <ul className="space-y-2 text-sm">
              {words.map((w, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold">{w.word}</span>
                    {w.partOfSpeech && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({w.partOfSpeech})
                      </span>
                    )}
                    {w.meaning && <span> — {w.meaning}</span>}
                    {w.example && (
                      <p className="mt-0.5 text-xs italic text-muted-foreground">
                        "{w.example}"
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    disabled={isInFlashcard(w.word)}
                    onClick={() => handleAdd(w)}
                    title={
                      isInFlashcard(w.word)
                        ? 'Already in flashcards'
                        : 'Add to flashcards'
                    }
                  >
                    {isInFlashcard(w.word) ? (
                      <BookmarkCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <BookmarkPlus className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
