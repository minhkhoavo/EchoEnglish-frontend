/**
 * FillBlankExercise Component
 *
 * Bài tập điền từ khuyết - Học viên đọc và điền từ còn thiếu
 *
 * Phương pháp giáo dục:
 * - Củng cố từ vựng trong ngữ cảnh (vocabulary in context)
 * - Phát triển grammar awareness
 * - Cải thiện reading comprehension
 * - Đánh giá khả năng hiểu cấu trúc câu
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  X,
  Lightbulb,
  Eye,
  EyeOff,
  ChevronRight,
  Shuffle,
  BookOpen,
  HelpCircle,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '../hooks/useTTS';
import type {
  FillBlanksExercise as FillBlanksExerciseType,
  FillBlanksAnswer,
  ReadingDifficulty,
  BlankItem,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface FillBlankExerciseProps {
  segment: {
    id: string;
    text: string;
    sentences: string[];
  };
  difficulty: ReadingDifficulty;
  onComplete: (answer: FillBlanksAnswer) => void;
  onSkip?: () => void;
  showWordBank?: boolean;
  showHints?: boolean;
  enableTTS?: boolean;
  className?: string;
}

interface BlankState {
  index: number;
  word: string;
  wordType: string;
  hint: string;
  position: number;
  userInput: string;
  isCorrect: boolean | null;
  showHint: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const WORD_TYPES = {
  NOUN: ['person', 'place', 'thing', 'animal', 'idea'],
  VERB: ['action', 'state', 'occurrence'],
  ADJECTIVE: ['describing word'],
  ADVERB: ['how', 'when', 'where'],
  PREPOSITION: ['position', 'direction', 'time'],
  ARTICLE: ['a', 'an', 'the'],
  CONJUNCTION: ['and', 'but', 'or', 'so'],
};

const COMMON_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'and',
  'but',
  'or',
  'so',
  'yet',
  'not',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
]);

const detectWordType = (word: string): string => {
  const lower = word.toLowerCase();

  if (['a', 'an', 'the'].includes(lower)) return 'article';
  if (['is', 'are', 'was', 'were', 'be', 'been', 'being', 'am'].includes(lower))
    return 'verb';
  if (['have', 'has', 'had'].includes(lower)) return 'verb';
  if (['do', 'does', 'did'].includes(lower)) return 'verb';
  if (
    [
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'must',
      'shall',
      'can',
    ].includes(lower)
  )
    return 'verb';
  if (
    ['to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as'].includes(
      lower
    )
  )
    return 'preposition';
  if (['and', 'but', 'or', 'so', 'yet', 'nor'].includes(lower))
    return 'conjunction';

  // Simple heuristics for other types
  if (lower.endsWith('ly')) return 'adverb';
  if (lower.endsWith('ing') || lower.endsWith('ed') || lower.endsWith('es'))
    return 'verb';
  if (
    lower.endsWith('tion') ||
    lower.endsWith('ness') ||
    lower.endsWith('ment')
  )
    return 'noun';
  if (lower.endsWith('ful') || lower.endsWith('ous') || lower.endsWith('ive'))
    return 'adjective';

  return 'other';
};

const generateBlanks = (
  text: string,
  difficulty: ReadingDifficulty
): BlankState[] => {
  const words = text.split(/\s+/);
  const blankRatio =
    difficulty === 'beginner'
      ? 0.12
      : difficulty === 'intermediate'
        ? 0.2
        : 0.3;

  const targetCount = Math.max(2, Math.floor(words.length * blankRatio));

  // Categorize words
  const contentWords: number[] = [];
  const functionWords: number[] = [];

  let position = 0;
  words.forEach((word, idx) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length >= 2) {
      if (COMMON_WORDS.has(cleanWord)) {
        functionWords.push(idx);
      } else if (cleanWord.length >= 3) {
        contentWords.push(idx);
      }
    }
    position += word.length + 1;
  });

  // Select based on difficulty
  let candidates: number[] = [];
  switch (difficulty) {
    case 'beginner':
      // Easy: mostly function words
      candidates = [...functionWords, ...contentWords.slice(0, 2)];
      break;
    case 'intermediate':
      // Mix of both
      candidates = [
        ...contentWords.slice(0, Math.ceil(contentWords.length * 0.7)),
        ...functionWords.slice(0, 3),
      ];
      break;
    case 'advanced':
      // Mostly content words, including longer ones
      candidates = contentWords.filter(
        (idx) => words[idx].replace(/[^a-z]/gi, '').length >= 4
      );
      if (candidates.length < targetCount) {
        candidates = [...contentWords];
      }
      break;
  }

  // Shuffle and select
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));

  // Calculate positions and create blank states
  let currentPos = 0;
  const blanks: BlankState[] = [];

  words.forEach((word, idx) => {
    if (selected.includes(idx)) {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      const wordType = detectWordType(cleanWord);

      // Generate hint based on difficulty
      let hint = '';
      if (difficulty === 'beginner') {
        hint = `${cleanWord[0]}${'_'.repeat(cleanWord.length - 1)}`;
      } else if (difficulty === 'intermediate') {
        hint = `${cleanWord[0]}... (${wordType})`;
      } else {
        hint = `(${cleanWord.length} letters)`;
      }

      blanks.push({
        index: idx,
        word: cleanWord,
        wordType,
        hint,
        position: currentPos,
        userInput: '',
        isCorrect: null,
        showHint: false,
      });
    }
    currentPos += word.length + 1;
  });

  return blanks.sort((a, b) => a.index - b.index);
};

const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .trim();
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FillBlankExercise: React.FC<FillBlankExerciseProps> = ({
  segment,
  difficulty,
  onComplete,
  onSkip,
  showWordBank = true,
  showHints = true,
  enableTTS = true,
  className,
}) => {
  // State
  const [blanks, setBlanks] = useState<BlankState[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(
    null
  );
  const [startTime] = useState(Date.now());

  // TTS Hook
  const tts = useTTS();

  // Initialize when segment changes
  useEffect(() => {
    const newBlanks = generateBlanks(segment.text, difficulty);
    setBlanks(newBlanks);
    setIsChecked(false);
    setShowAnswers(false);
    setSelectedBlankIndex(null);

    // Generate word bank with distractors
    if (showWordBank) {
      const correctWords = newBlanks.map((b) => b.word);
      // Add some distractors
      const allWords = segment.text
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z]/g, ''))
        .filter((w) => w.length >= 3 && !correctWords.includes(w));

      const distractors = shuffleArray(allWords).slice(
        0,
        Math.min(3, allWords.length)
      );
      setWordBank(shuffleArray([...correctWords, ...distractors]));
    }
  }, [segment, difficulty, showWordBank]);

  // Render text with blanks
  const renderText = useCallback(() => {
    const words = segment.text.split(/\s+/);
    const blankIndices = new Set(blanks.map((b) => b.index));

    return words.map((word, idx) => {
      if (blankIndices.has(idx)) {
        const blank = blanks.find((b) => b.index === idx)!;
        const blankIdx = blanks.indexOf(blank);
        const punctuation = word.match(/[^a-zA-Z]+$/)?.[0] || '';

        return (
          <span key={idx} className="inline-flex items-center mx-0.5">
            <span
              className={cn(
                'relative inline-block min-w-[80px] border-b-2 px-1 py-0.5 cursor-pointer transition-all',
                !isChecked &&
                  selectedBlankIndex === blankIdx &&
                  'bg-blue-100 border-blue-500',
                !isChecked &&
                  selectedBlankIndex !== blankIdx &&
                  'border-gray-400 hover:border-blue-400',
                isChecked && blank.isCorrect && 'bg-green-100 border-green-500',
                isChecked && !blank.isCorrect && 'bg-red-100 border-red-500'
              )}
              onClick={() => !isChecked && setSelectedBlankIndex(blankIdx)}
            >
              {blank.userInput || (
                <span className="text-gray-400 text-sm">
                  {showHints && blank.showHint ? blank.hint : '______'}
                </span>
              )}
              {isChecked && !blank.isCorrect && showAnswers && (
                <span className="absolute -bottom-6 left-0 text-xs text-green-600 whitespace-nowrap font-medium">
                  → {blank.word}
                </span>
              )}
            </span>
            {punctuation}
          </span>
        );
      }
      return (
        <span key={idx} className="mx-0.5">
          {word}
        </span>
      );
    });
  }, [
    segment.text,
    blanks,
    isChecked,
    showAnswers,
    selectedBlankIndex,
    showHints,
  ]);

  // Handle word bank click
  const handleWordBankClick = (word: string) => {
    if (isChecked || selectedBlankIndex === null) return;

    setBlanks((prev) =>
      prev.map((blank, idx) =>
        idx === selectedBlankIndex ? { ...blank, userInput: word } : blank
      )
    );

    // Move to next empty blank
    const nextEmpty = blanks.findIndex(
      (b, idx) => idx > selectedBlankIndex && !b.userInput
    );
    setSelectedBlankIndex(nextEmpty >= 0 ? nextEmpty : null);
  };

  // Handle clearing a blank
  const handleClearBlank = (blankIdx: number) => {
    if (isChecked) return;
    setBlanks((prev) =>
      prev.map((blank, idx) =>
        idx === blankIdx ? { ...blank, userInput: '' } : blank
      )
    );
  };

  // Toggle hint for a blank
  const toggleHint = (blankIdx: number) => {
    setBlanks((prev) =>
      prev.map((blank, idx) =>
        idx === blankIdx ? { ...blank, showHint: !blank.showHint } : blank
      )
    );
  };

  // Check answers
  const handleCheck = () => {
    const checkedBlanks = blanks.map((blank) => ({
      ...blank,
      isCorrect:
        normalizeAnswer(blank.userInput) === normalizeAnswer(blank.word),
    }));

    setBlanks(checkedBlanks);
    setIsChecked(true);
  };

  // Complete exercise
  const handleComplete = () => {
    const correctCount = blanks.filter((b) => b.isCorrect).length;
    const score = Math.round((correctCount / blanks.length) * 100);

    const answer: FillBlanksAnswer = {
      exerciseId: segment.id,
      answers: blanks.map((blank, idx) => ({
        blankIndex: idx,
        userAnswer: blank.userInput,
        isCorrect: blank.isCorrect || false,
      })),
      score,
      timeSpent: Date.now() - startTime,
    };

    onComplete(answer);
  };

  // Reset exercise
  const handleReset = () => {
    setBlanks((prev) =>
      prev.map((blank) => ({
        ...blank,
        userInput: '',
        isCorrect: null,
      }))
    );
    setIsChecked(false);
    setShowAnswers(false);
    setSelectedBlankIndex(0);
  };

  // Play TTS for context
  const handlePlayTTS = () => {
    if (enableTTS) {
      tts.play(segment.text);
    }
  };

  // Calculate progress
  const filledCount = blanks.filter((b) => b.userInput.trim()).length;
  const correctCount = blanks.filter((b) => b.isCorrect).length;
  const progress = Math.round((filledCount / Math.max(blanks.length, 1)) * 100);

  // Used words in word bank
  const usedWords = new Set(blanks.map((b) => b.userInput.toLowerCase()));

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Fill in the Blanks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                difficulty === 'beginner'
                  ? 'secondary'
                  : difficulty === 'intermediate'
                    ? 'default'
                    : 'destructive'
              }
            >
              {difficulty}
            </Badge>
            <Badge variant="outline">{blanks.length} blanks</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Read the text and fill in the missing words
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex items-center gap-2">
          {enableTTS && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayTTS}
              disabled={tts.isLoading || tts.isPlaying}
            >
              <Volume2
                className={cn('w-4 h-4 mr-1', tts.isPlaying && 'animate-pulse')}
              />
              Listen
            </Button>
          )}

          {showHints && selectedBlankIndex !== null && !isChecked && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleHint(selectedBlankIndex)}
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              {blanks[selectedBlankIndex]?.showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {filledCount}/{blanks.length} filled
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Text with blanks */}
        <div className="p-4 bg-gray-50 rounded-lg leading-loose text-base min-h-[100px]">
          {renderText()}
        </div>

        {/* Word Bank */}
        {showWordBank && !isChecked && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shuffle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Word Bank
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {wordBank.map((word, idx) => (
                <Button
                  key={`${word}-${idx}`}
                  variant={
                    usedWords.has(word.toLowerCase()) ? 'secondary' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleWordBankClick(word)}
                  disabled={
                    selectedBlankIndex === null ||
                    usedWords.has(word.toLowerCase())
                  }
                  className={cn(
                    'transition-all',
                    usedWords.has(word.toLowerCase()) &&
                      'opacity-50 line-through'
                  )}
                >
                  {word}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Current selection info */}
        {selectedBlankIndex !== null && !isChecked && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>
              Filling blank #{selectedBlankIndex + 1}
              {blanks[selectedBlankIndex]?.wordType && (
                <Badge variant="outline" className="ml-2">
                  {blanks[selectedBlankIndex].wordType}
                </Badge>
              )}
            </span>
            {blanks[selectedBlankIndex]?.userInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearBlank(selectedBlankIndex)}
                className="h-6 px-2"
              >
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {isChecked && (
          <div
            className={cn(
              'p-4 rounded-lg',
              correctCount === blanks.length ? 'bg-green-50' : 'bg-amber-50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {correctCount === blanks.length ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-amber-600" />
                )}
                <span className="font-medium">
                  {correctCount === blanks.length
                    ? 'Perfect! All correct!'
                    : `${correctCount}/${blanks.length} correct (${Math.round((correctCount / blanks.length) * 100)}%)`}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswers(!showAnswers)}
              >
                {showAnswers ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" /> Hide Answers
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" /> Show Answers
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {!isChecked ? (
              <Button
                onClick={handleCheck}
                disabled={filledCount < blanks.length}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Check Answers
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <Shuffle className="w-4 h-4" />
                Try Again
              </Button>
            )}

            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
            )}
          </div>

          {isChecked && (
            <Button onClick={handleComplete} className="gap-2">
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FillBlankExercise;
