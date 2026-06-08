/**
 * DictationExercise Component
 *
 * Bài tập nghe chép - Học viên nghe TTS và điền từ còn thiếu
 *
 * Phương pháp giáo dục:
 * - Cải thiện kỹ năng nghe (listening comprehension)
 * - Củng cố spelling và phonetic awareness
 * - Phát triển working memory
 * - Kết hợp audio và visual learning
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '../hooks/useTTS';
import type {
  DictationExercise as DictationExerciseType,
  DictationAnswer,
  ReadingDifficulty,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface DictationExerciseProps {
  segment: {
    id: string;
    text: string;
    sentences: string[];
  };
  difficulty: ReadingDifficulty;
  onComplete: (answer: DictationAnswer) => void;
  onSkip?: () => void;
  showHints?: boolean;
  maxAttempts?: number;
  className?: string;
}

interface BlankWord {
  index: number;
  word: string;
  hint: string;
  userInput: string;
  isCorrect: boolean | null;
  attempts: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const selectWordsToHide = (
  text: string,
  difficulty: ReadingDifficulty
): BlankWord[] => {
  const words = text.split(/\s+/);
  const FUNCTION_WORDS = new Set([
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
  ]);

  // Calculate how many words to hide based on difficulty
  const hideRatio =
    difficulty === 'beginner'
      ? 0.15
      : difficulty === 'intermediate'
        ? 0.25
        : 0.35;

  const hideCount = Math.max(1, Math.floor(words.length * hideRatio));

  // Get candidate words (content words for harder, any for easier)
  const candidates: number[] = [];
  words.forEach((word, idx) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length >= 3) {
      if (difficulty === 'beginner') {
        // Beginner: prefer function words
        if (FUNCTION_WORDS.has(cleanWord)) {
          candidates.push(idx);
        }
      } else {
        // Intermediate/Advanced: prefer content words
        if (!FUNCTION_WORDS.has(cleanWord)) {
          candidates.push(idx);
        }
      }
    }
  });

  // If not enough candidates, use all valid words
  if (candidates.length < hideCount) {
    words.forEach((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (cleanWord.length >= 2 && !candidates.includes(idx)) {
        candidates.push(idx);
      }
    });
  }

  // Shuffle and select
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, hideCount);

  return selected
    .map((index) => {
      const word = words[index];
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      const hint =
        difficulty === 'beginner'
          ? `${cleanWord[0]}${'_'.repeat(cleanWord.length - 1)} (${cleanWord.length} letters)`
          : difficulty === 'intermediate'
            ? `${cleanWord[0]}... (${cleanWord.length} letters)`
            : `(${cleanWord.length} letters)`;

      return {
        index,
        word: cleanWord,
        hint,
        userInput: '',
        isCorrect: null,
        attempts: 0,
      };
    })
    .sort((a, b) => a.index - b.index);
};

const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .trim();
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DictationExercise: React.FC<DictationExerciseProps> = ({
  segment,
  difficulty,
  onComplete,
  onSkip,
  showHints = true,
  maxAttempts = 3,
  className,
}) => {
  // State
  const [blanks, setBlanks] = useState<BlankWord[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [startTime] = useState(Date.now());
  const [playCount, setPlayCount] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // TTS Hook
  const tts = useTTS({
    onComplete: () => setPlayCount((prev) => prev + 1),
  });

  // Initialize blanks when segment changes
  useEffect(() => {
    const newBlanks = selectWordsToHide(segment.text, difficulty);
    setBlanks(newBlanks);
    setIsChecked(false);
    setShowAnswers(false);
    setPlayCount(0);
  }, [segment, difficulty]);

  // Handle input change - defined before displayText to avoid hoisting issues
  const handleInputChange = useCallback((blankIndex: number, value: string) => {
    setBlanks((prev) =>
      prev.map((blank, idx) =>
        idx === blankIndex ? { ...blank, userInput: value } : blank
      )
    );
  }, []);

  // Complete exercise
  const handleComplete = useCallback(
    (finalBlanks: BlankWord[]) => {
      const correctCount = finalBlanks.filter((b) => b.isCorrect).length;
      const accuracy = Math.round((correctCount / finalBlanks.length) * 100);

      const answer: DictationAnswer = {
        exerciseId: segment.id,
        userInput: finalBlanks.map((b) => b.userInput),
        correctWords: finalBlanks.map((b) => b.word),
        accuracy,
        mistakes: finalBlanks
          .filter((b) => !b.isCorrect)
          .map((b) => ({
            index: b.index,
            expected: b.word,
            actual: b.userInput,
          })),
        timeSpent: Date.now() - startTime,
      };

      onComplete(answer);
    },
    [segment.id, startTime, onComplete]
  );

  // Check answers - defined before displayText
  const handleCheck = useCallback(() => {
    const checkedBlanks = blanks.map((blank) => ({
      ...blank,
      isCorrect:
        normalizeAnswer(blank.userInput) === normalizeAnswer(blank.word),
      attempts: blank.attempts + 1,
    }));

    setBlanks(checkedBlanks);
    setIsChecked(true);

    // Check if all correct
    const allCorrect = checkedBlanks.every((b) => b.isCorrect);
    if (allCorrect) {
      handleComplete(checkedBlanks);
    }
  }, [blanks, handleComplete]);

  // Handle keyboard navigation - defined before displayText
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, blankIndex: number) => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = blankIndex + 1;
        if (nextIndex < blanks.length) {
          inputRefs.current[nextIndex]?.focus();
        } else if (e.key === 'Enter') {
          handleCheck();
        }
      }
    },
    [blanks.length, handleCheck]
  );

  // Generate display text with blanks
  const displayText = useCallback(() => {
    const words = segment.text.split(/\s+/);
    const blankIndices = new Set(blanks.map((b) => b.index));

    return words.map((word, idx) => {
      if (blankIndices.has(idx)) {
        const blank = blanks.find((b) => b.index === idx)!;
        const blankIndex = blanks.indexOf(blank);

        return (
          <span key={idx} className="inline-flex items-center mx-1">
            <span className="relative">
              <Input
                ref={(el) => {
                  inputRefs.current[blankIndex] = el;
                }}
                value={blank.userInput}
                onChange={(e) => handleInputChange(blankIndex, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, blankIndex)}
                disabled={isChecked}
                className={cn(
                  'w-24 h-8 text-center font-mono text-sm',
                  isChecked &&
                    blank.isCorrect === true &&
                    'bg-green-100 border-green-500',
                  isChecked &&
                    blank.isCorrect === false &&
                    'bg-red-100 border-red-500',
                  !isChecked &&
                    'bg-blue-50 border-blue-300 focus:border-blue-500'
                )}
                placeholder={showHints ? blank.hint : '...'}
              />
              {isChecked && blank.isCorrect === false && showAnswers && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-green-600 text-white text-sm font-semibold rounded whitespace-nowrap z-10">
                  {blank.word}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-green-600"></span>
                </span>
              )}
            </span>
            {/* Preserve punctuation after word */}
            {word.match(/[^a-zA-Z]+$/)?.[0] || ''}
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
    showHints,
    handleInputChange,
    handleKeyDown,
  ]);

  // Play TTS
  const handlePlayTTS = () => {
    tts.play(segment.text);
  };

  // Retry incorrect answers
  const handleRetry = () => {
    setBlanks((prev) =>
      prev.map((blank) => ({
        ...blank,
        userInput: blank.isCorrect ? blank.userInput : '',
        isCorrect: blank.isCorrect ? true : null,
      }))
    );
    setIsChecked(false);

    // Focus first incorrect blank
    const firstIncorrect = blanks.findIndex((b) => !b.isCorrect);
    if (firstIncorrect >= 0) {
      setTimeout(() => inputRefs.current[firstIncorrect]?.focus(), 100);
    }
  };

  // Force complete with current state
  const handleForceComplete = () => {
    handleComplete(blanks);
  };

  // Calculate progress
  const filledCount = blanks.filter((b) => b.userInput.trim()).length;
  const correctCount = blanks.filter((b) => b.isCorrect).length;
  const progress = Math.round((filledCount / Math.max(blanks.length, 1)) * 100);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-500" />
            Dictation Exercise
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
          Listen to the audio and fill in the missing words
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* TTS Controls */}
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <Button
            variant="default"
            size="sm"
            onClick={handlePlayTTS}
            disabled={tts.isLoading}
            className="gap-2"
          >
            {tts.isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Playing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Listen
              </>
            )}
          </Button>

          {tts.isPlaying && (
            <Button variant="outline" size="sm" onClick={tts.stop}>
              <VolumeX className="w-4 h-4" />
            </Button>
          )}

          <span className="text-sm text-muted-foreground ml-auto">
            Played: {playCount} time{playCount !== 1 ? 's' : ''}
          </span>
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
        <div className="p-4 bg-gray-50 rounded-lg leading-relaxed text-base">
          {displayText()}
        </div>

        {/* Hints section */}
        {showHints && !isChecked && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span>Tip: Press Tab to move between blanks, Enter to check</span>
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
                    : `${correctCount}/${blanks.length} correct`}
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

            {correctCount < blanks.length && (
              <p className="text-sm text-muted-foreground mt-2">
                {blanks[0].attempts < maxAttempts
                  ? 'Try again! Listen carefully to the audio.'
                  : 'Maximum attempts reached. Review the answers above.'}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {!isChecked ? (
              <Button
                onClick={handleCheck}
                disabled={filledCount === 0}
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Check Answers
              </Button>
            ) : correctCount < blanks.length &&
              blanks[0].attempts < maxAttempts ? (
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            ) : null}

            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip
              </Button>
            )}
          </div>

          {isChecked && (
            <Button onClick={handleForceComplete} className="gap-2">
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DictationExercise;
