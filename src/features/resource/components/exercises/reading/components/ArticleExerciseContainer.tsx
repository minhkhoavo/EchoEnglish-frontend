/**
 * ArticleExerciseContainer Component
 *
 * Container chính quản lý tất cả các loại bài tập đọc Article
 *
 * Features:
 * - Chọn loại bài tập
 * - Chọn độ khó
 * - Chọn đoạn văn để luyện tập
 * - Tracking progress
 * - Session management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Volume2,
  PenLine,
  BookOpen,
  ListOrdered,
  Brain,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Play,
  Settings,
  X,
  Check,
  Star,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { DictationExercise } from './DictationExercise';
import { FillBlankExercise } from './FillBlankExercise';
import { ReadingComprehensionExercise } from './ReadingComprehensionExercise';
import { SentenceReorderExercise } from './SentenceReorderExercise';
import { ParagraphSummaryExercise } from './ParagraphSummaryExercise';

// Types
import type {
  ReadingExerciseType,
  ReadingDifficulty,
  ReadingAnswer,
  ArticleSegment,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface ArticleExerciseContainerProps {
  articleId?: string;
  articleTitle?: string;
  articleContent?: string;
  id?: string;
  title?: string;
  content?: string;
  onClose?: () => void;
  className?: string;
}

interface ExerciseResult {
  type: ReadingExerciseType;
  segmentId: string;
  score: number;
  maxScore: number;
  timeSpent: number;
  completedAt: Date;
}

// ============================================================================
// EXERCISE TYPE CONFIGURATION
// ============================================================================

const EXERCISE_TYPES = [
  {
    id: 'dictation' as const,
    label: 'Dictation',
    icon: Volume2,
    description: 'Listen and type what you hear',
    color: 'bg-blue-500',
    skills: ['Listening', 'Spelling'],
  },
  {
    id: 'fill_blanks' as const,
    label: 'Fill Blanks',
    icon: PenLine,
    description: 'Complete the missing words',
    color: 'bg-purple-500',
    skills: ['Vocabulary', 'Grammar'],
  },
  {
    id: 'comprehension' as const,
    label: 'Comprehension',
    icon: Brain,
    description: 'Answer questions about the text',
    color: 'bg-green-500',
    skills: ['Reading', 'Analysis'],
  },
  {
    id: 'sentence_reorder' as const,
    label: 'Sentence Order',
    icon: ListOrdered,
    description: 'Arrange sentences correctly',
    color: 'bg-orange-500',
    skills: ['Logic', 'Coherence'],
  },
  {
    id: 'paragraph_summary' as const,
    label: 'Summary',
    icon: BookOpen,
    description: 'Write a summary of the passage',
    color: 'bg-indigo-500',
    skills: ['Writing', 'Synthesis'],
  },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner' as const, label: 'Beginner', description: 'A1-A2 Level' },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    description: 'B1-B2 Level',
  },
  { value: 'advanced' as const, label: 'Advanced', description: 'C1-C2 Level' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Strip HTML tags and extract plain text from HTML content
 */
const stripHtml = (html: string): string => {
  // Create a temporary DOM element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script and style elements
  const scripts = temp.querySelectorAll('script, style, noscript');
  scripts.forEach((el) => el.remove());

  // Get text content
  let text = temp.textContent || temp.innerText || '';

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/\n\s*\n/g, '\n\n') // Clean up newlines
    .trim();

  return text;
};

/**
 * Split content into segments of 3-4 sentences each
 */
const splitIntoSegments = (content: string | undefined): ArticleSegment[] => {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return [
      {
        id: 'segment-0',
        text: 'No content available',
        sentences: ['No content available'],
        wordCount: 0,
        startIndex: 0,
      },
    ];
  }

  // Strip HTML tags to get plain text
  const plainText = stripHtml(content);

  if (!plainText || plainText.length < 10) {
    return [
      {
        id: 'segment-0',
        text: 'No readable content found',
        sentences: ['No readable content found'],
        wordCount: 0,
        startIndex: 0,
      },
    ];
  }

  // Split into sentences (handle common sentence endings)
  const sentenceRegex = /[^.!?]*[.!?]+/g;
  const rawSentences = plainText.match(sentenceRegex) || [];

  // Clean and filter sentences
  const sentences = rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.split(/\s+/).length >= 3); // At least 3 words

  if (sentences.length === 0) {
    // Fallback: split by periods or create one segment
    const fallbackSentences = plainText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    if (fallbackSentences.length === 0) {
      return [
        {
          id: 'segment-0',
          text: plainText.slice(0, 500),
          sentences: [plainText.slice(0, 500)],
          wordCount: plainText.split(/\s+/).length,
          startIndex: 0,
        },
      ];
    }

    sentences.push(...fallbackSentences.map((s) => s + '.'));
  }

  // Group sentences into segments (3-4 sentences per segment)
  const SENTENCES_PER_SEGMENT = 3;
  const segments: ArticleSegment[] = [];

  for (let i = 0; i < sentences.length; i += SENTENCES_PER_SEGMENT) {
    const segmentSentences = sentences.slice(i, i + SENTENCES_PER_SEGMENT);
    const segmentText = segmentSentences.join(' ');

    segments.push({
      id: `segment-${segments.length}`,
      text: segmentText,
      sentences: segmentSentences,
      wordCount: segmentText.split(/\s+/).filter((w) => w).length,
      startIndex: i,
    });
  }

  return segments;
};

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ArticleExerciseContainer: React.FC<
  ArticleExerciseContainerProps
> = ({
  articleId,
  articleTitle,
  articleContent,
  id,
  title,
  content,
  onClose,
  className,
}) => {
  // Handle both prop naming conventions
  const finalArticleId = articleId || id || 'unknown';
  const finalArticleTitle = articleTitle || title || 'Article';
  const finalArticleContent = articleContent || content || '';

  // State
  const [selectedExercise, setSelectedExercise] =
    useState<ReadingExerciseType | null>(null);
  const [difficulty, setDifficulty] =
    useState<ReadingDifficulty>('intermediate');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  // Memoized segments
  const segments = useMemo(
    () => splitIntoSegments(finalArticleContent),
    [finalArticleContent]
  );
  const currentSegment = segments[currentSegmentIndex];

  // Handle exercise completion
  const handleExerciseComplete = useCallback(
    (answer: ReadingAnswer) => {
      const result: ExerciseResult = {
        type: selectedExercise!,
        segmentId: currentSegment.id,
        score:
          'score' in answer
            ? answer.score
            : 'accuracy' in answer
              ? answer.accuracy
              : 'totalScore' in answer
                ? (answer.totalScore /
                    (answer as { maxScore: number }).maxScore) *
                  100
                : 0,
        maxScore: 100,
        timeSpent: 'timeSpent' in answer ? answer.timeSpent : 0,
        completedAt: new Date(),
      };

      setResults((prev) => [...prev, result]);

      // Auto-advance to next segment if available
      if (currentSegmentIndex < segments.length - 1) {
        setCurrentSegmentIndex((prev) => prev + 1);
      }
    },
    [selectedExercise, currentSegment, currentSegmentIndex, segments.length]
  );

  // Handle skip
  const handleSkip = useCallback(() => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
    } else {
      setSelectedExercise(null);
    }
  }, [currentSegmentIndex, segments.length]);

  // Calculate overall progress
  const completedCount = results.length;
  const totalPossible = segments.length * EXERCISE_TYPES.length;
  const overallProgress = Math.round((completedCount / totalPossible) * 100);
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / results.length
        )
      : 0;

  // Render exercise selection screen
  const renderExerciseSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{articleTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {segments.length} segments available for practice
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Difficulty
                </label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as ReadingDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            ({opt.description})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Start from Segment
                </label>
                <Select
                  value={String(currentSegmentIndex)}
                  onValueChange={(v) => setCurrentSegmentIndex(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((seg, idx) => (
                      <SelectItem key={seg.id} value={String(idx)}>
                        Segment {idx + 1} ({seg.wordCount} words)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      {results.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Session Progress</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Avg: {averageScore}%
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  {formatTime(Date.now() - sessionStartTime)}
                </span>
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount} exercises completed
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exercise Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXERCISE_TYPES.map((exercise) => {
          const Icon = exercise.icon;
          const completedForType = results.filter(
            (r) => r.type === exercise.id
          ).length;

          return (
            <Card
              key={exercise.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
                'border-2 hover:border-blue-300'
              )}
              onClick={() => setSelectedExercise(exercise.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-white',
                      exercise.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{exercise.label}</h3>
                      {completedForType > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {completedForType} done
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exercise.description}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {exercise.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Segment Preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Current Segment: {currentSegmentIndex + 1} of {segments.length}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentSegmentIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentSegmentIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentSegmentIndex((prev) =>
                    Math.min(segments.length - 1, prev + 1)
                  )
                }
                disabled={currentSegmentIndex === segments.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <p className="text-sm text-gray-600 leading-relaxed">
              {currentSegment?.text}
            </p>
          </ScrollArea>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline">{currentSegment?.wordCount} words</Badge>
            <Badge variant="outline">
              {currentSegment?.sentences.length} sentences
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render active exercise
  const renderExercise = () => {
    if (!selectedExercise || !currentSegment) return null;

    const commonProps = {
      segment: currentSegment,
      difficulty,
      onComplete: handleExerciseComplete,
      onSkip: handleSkip,
      enableTTS: true,
    };

    return (
      <div className="space-y-4">
        {/* Exercise Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedExercise(null)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Exercises
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Segment {currentSegmentIndex + 1}/{segments.length}
            </Badge>
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
          </div>
        </div>

        {/* Segment Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentSegmentIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentSegmentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Progress
            value={((currentSegmentIndex + 1) / segments.length) * 100}
            className="flex-1 h-2"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentSegmentIndex((prev) =>
                Math.min(segments.length - 1, prev + 1)
              )
            }
            disabled={currentSegmentIndex === segments.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Exercise Component */}
        {selectedExercise === 'dictation' && (
          <DictationExercise {...commonProps} />
        )}
        {selectedExercise === 'fill_blanks' && (
          <FillBlankExercise {...commonProps} />
        )}
        {selectedExercise === 'comprehension' && (
          <ReadingComprehensionExercise {...commonProps} />
        )}
        {selectedExercise === 'sentence_reorder' && (
          <SentenceReorderExercise {...commonProps} />
        )}
        {selectedExercise === 'paragraph_summary' && (
          <ParagraphSummaryExercise {...commonProps} />
        )}
      </div>
    );
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {selectedExercise ? renderExercise() : renderExerciseSelection()}
      </CardContent>
    </Card>
  );
};

export default ArticleExerciseContainer;
