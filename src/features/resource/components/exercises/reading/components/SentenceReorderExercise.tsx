/**
 * SentenceReorderExercise Component
 *
 * Bài tập sắp xếp câu - Học viên sắp xếp lại thứ tự các câu bị xáo trộn
 *
 * Phương pháp giáo dục:
 * - Phát triển kỹ năng hiểu cấu trúc văn bản
 * - Nhận biết các từ nối, transition words
 * - Cải thiện logic flow và coherence
 * - Luyện kỹ năng viết mạch lạc
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  X,
  ChevronRight,
  Lightbulb,
  ListOrdered,
  ArrowUpDown,
  RotateCcw,
  Volume2,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '../hooks/useTTS';
import type {
  SentenceReorderExercise as SentenceReorderExerciseType,
  SentenceReorderAnswer,
  ReadingDifficulty,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface SentenceReorderExerciseProps {
  segment: {
    id: string;
    text: string;
    sentences: string[];
  };
  difficulty: ReadingDifficulty;
  onComplete: (answer: SentenceReorderAnswer) => void;
  onSkip?: () => void;
  enableTTS?: boolean;
  className?: string;
}

interface SentenceItem {
  id: string;
  text: string;
  originalIndex: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Make sure it's actually shuffled
  if (JSON.stringify(shuffled) === JSON.stringify(array)) {
    return shuffleArray(shuffled);
  }
  return shuffled;
};

const splitIntoSentences = (text: string): string[] => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SentenceReorderExercise: React.FC<
  SentenceReorderExerciseProps
> = ({
  segment,
  difficulty,
  onComplete,
  onSkip,
  enableTTS = true,
  className,
}) => {
  // State
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [userOrder, setUserOrder] = useState<SentenceItem[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<boolean[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  // TTS Hook
  const tts = useTTS();

  // Initialize sentences
  useEffect(() => {
    const rawSentences = splitIntoSentences(segment.text);
    const items: SentenceItem[] = rawSentences.map((text, idx) => ({
      id: `s-${idx}`,
      text,
      originalIndex: idx,
    }));

    setSentences(items);

    // Shuffle based on difficulty
    const shuffledCount =
      difficulty === 'beginner'
        ? Math.min(3, items.length)
        : difficulty === 'intermediate'
          ? Math.min(5, items.length)
          : items.length;

    const toShuffle = items.slice(0, shuffledCount);
    const shuffled = shuffleArray(toShuffle);
    setUserOrder(shuffled);
    setIsChecked(false);
    setCorrectPositions([]);
  }, [segment, difficulty]);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setUserOrder(newOrder);
    setDraggedIndex(index);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Move sentence up
  const moveUp = (index: number) => {
    if (index === 0 || isChecked) return;
    const newOrder = [...userOrder];
    [newOrder[index], newOrder[index - 1]] = [
      newOrder[index - 1],
      newOrder[index],
    ];
    setUserOrder(newOrder);
  };

  // Move sentence down
  const moveDown = (index: number) => {
    if (index === userOrder.length - 1 || isChecked) return;
    const newOrder = [...userOrder];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setUserOrder(newOrder);
  };

  // Check answer
  const handleCheck = () => {
    const positions = userOrder.map(
      (sentence, idx) => sentence.originalIndex === idx
    );
    setCorrectPositions(positions);
    setIsChecked(true);
  };

  // Reset exercise
  const handleReset = () => {
    setUserOrder(shuffleArray([...userOrder]));
    setIsChecked(false);
    setCorrectPositions([]);
  };

  // Complete exercise
  const handleComplete = () => {
    const correctCount = correctPositions.filter(Boolean).length;

    const answer: SentenceReorderAnswer = {
      exerciseId: segment.id,
      userOrder: userOrder.map((s) => s.id),
      isCorrect: correctCount === userOrder.length,
      correctPositions: correctCount,
      totalPositions: userOrder.length,
      timeSpent: Date.now() - startTime,
    };

    onComplete(answer);
  };

  // Play TTS for a sentence
  const handlePlaySentence = (text: string) => {
    if (enableTTS) {
      tts.play(text);
    }
  };

  // Calculate progress
  const correctCount = correctPositions.filter(Boolean).length;
  const progress = isChecked
    ? Math.round((correctCount / userOrder.length) * 100)
    : 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-orange-500" />
            Sentence Reorder
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
            <Badge variant="outline">{userOrder.length} sentences</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Drag and drop to arrange the sentences in the correct order
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Instructions */}
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
          <ArrowUpDown className="w-4 h-4 text-orange-600" />
          <span className="text-sm text-orange-700">
            {isChecked
              ? `${correctCount}/${userOrder.length} sentences in correct position`
              : 'Rearrange the sentences to form a coherent paragraph'}
          </span>
        </div>

        {/* Progress (when checked) */}
        {isChecked && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Accuracy</span>
              <span>
                {correctCount}/{userOrder.length} correct
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Sentences */}
        <div className="space-y-2">
          {userOrder.map((sentence, idx) => (
            <div
              key={sentence.id}
              draggable={!isChecked}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-start gap-2 p-3 rounded-lg border transition-all',
                !isChecked &&
                  'cursor-move hover:border-orange-300 hover:bg-orange-50',
                isChecked &&
                  correctPositions[idx] &&
                  'border-green-500 bg-green-50',
                isChecked &&
                  !correctPositions[idx] &&
                  'border-red-500 bg-red-50',
                draggedIndex === idx && 'opacity-50 scale-95'
              )}
            >
              {/* Drag Handle */}
              <div
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium',
                  !isChecked && 'bg-gray-200 text-gray-600',
                  isChecked &&
                    correctPositions[idx] &&
                    'bg-green-200 text-green-700',
                  isChecked &&
                    !correctPositions[idx] &&
                    'bg-red-200 text-red-700'
                )}
              >
                {idx + 1}
              </div>

              {/* Grip Icon */}
              {!isChecked && (
                <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              )}

              {/* Sentence Text */}
              <p className="flex-1 text-sm leading-relaxed">{sentence.text}</p>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {enableTTS && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlaySentence(sentence.text)}
                    className="h-7 w-7 p-0"
                  >
                    <Volume2
                      className={cn(
                        'w-3 h-3',
                        tts.isPlaying && 'animate-pulse'
                      )}
                    />
                  </Button>
                )}

                {!isChecked && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="h-7 w-7 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(idx)}
                      disabled={idx === userOrder.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      ↓
                    </Button>
                  </>
                )}

                {isChecked &&
                  (correctPositions[idx] ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Correct order hint (when checked and incorrect) */}
        {isChecked && correctCount < userOrder.length && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Correct Order:
              </span>
            </div>
            <div className="space-y-1">
              {sentences.slice(0, userOrder.length).map((sentence, idx) => (
                <p key={sentence.id} className="text-sm text-gray-600">
                  <span className="font-medium">{idx + 1}.</span>{' '}
                  {sentence.text.slice(0, 50)}...
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {!isChecked ? (
              <Button onClick={handleCheck} className="gap-2">
                <Check className="w-4 h-4" />
                Check Order
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
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

export default SentenceReorderExercise;
