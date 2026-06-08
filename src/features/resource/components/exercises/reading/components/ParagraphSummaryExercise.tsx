/**
 * ParagraphSummaryExercise Component
 *
 * Bài tập viết tóm tắt - Học viên đọc và viết tóm tắt đoạn văn
 * AI sẽ đánh giá và cho feedback
 *
 * Phương pháp giáo dục:
 * - Phát triển kỹ năng tổng hợp thông tin (synthesis)
 * - Luyện kỹ năng viết (writing skills)
 * - Cải thiện khả năng paraphrase
 * - Rèn luyện critical thinking
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Check,
  ChevronRight,
  Lightbulb,
  PenLine,
  Loader2,
  Send,
  RotateCcw,
  Volume2,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '../hooks/useTTS';
import {
  useEvaluateAnswerMutation,
  buildSummaryEvaluationPrompt,
} from '../services/readingExerciseApi';
import type {
  ParagraphSummaryExercise as ParagraphSummaryExerciseType,
  ParagraphSummaryAnswer,
  ReadingDifficulty,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface ParagraphSummaryExerciseProps {
  segment: {
    id: string;
    text: string;
    sentences: string[];
  };
  difficulty: ReadingDifficulty;
  onComplete: (answer: ParagraphSummaryAnswer) => void;
  onSkip?: () => void;
  enableTTS?: boolean;
  minWords?: number;
  maxWords?: number;
  className?: string;
}

interface AIEvaluation {
  score: number;
  maxScore: number;
  feedback: string;
  mainIdeaCaptured: boolean;
  coveredKeyPoints?: string[];
  missingPoints?: string[];
  strengths?: string[];
  improvements?: string[];
  grammarIssues?: string[];
  suggestions?: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const countWords = (text: string): number => {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
};

const extractKeyPoints = (text: string): string[] => {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
  // Simple heuristic: first and last sentences often contain key information
  const keyPoints: string[] = [];

  if (sentences.length > 0) {
    keyPoints.push(sentences[0].slice(0, 100));
  }
  if (sentences.length > 2) {
    keyPoints.push(sentences[Math.floor(sentences.length / 2)].slice(0, 100));
  }
  if (sentences.length > 1) {
    keyPoints.push(sentences[sentences.length - 1].slice(0, 100));
  }

  return keyPoints;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ParagraphSummaryExercise: React.FC<
  ParagraphSummaryExerciseProps
> = ({
  segment,
  difficulty,
  onComplete,
  onSkip,
  enableTTS = true,
  className,
}) => {
  // Calculate word limits based on difficulty
  const getWordLimits = () => {
    const textWords = countWords(segment.text);
    switch (difficulty) {
      case 'beginner':
        return {
          min: Math.max(10, Math.floor(textWords * 0.2)),
          max: Math.floor(textWords * 0.4),
        };
      case 'intermediate':
        return {
          min: Math.max(15, Math.floor(textWords * 0.15)),
          max: Math.floor(textWords * 0.3),
        };
      case 'advanced':
        return {
          min: Math.max(20, Math.floor(textWords * 0.1)),
          max: Math.floor(textWords * 0.25),
        };
    }
  };

  const { min: minWords, max: maxWords } = getWordLimits();

  // State
  const [userSummary, setUserSummary] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  // API Hooks
  const [evaluateAnswer] = useEvaluateAnswerMutation();

  // TTS Hook
  const tts = useTTS();

  // Word count
  const wordCount = countWords(userSummary);
  const isWithinLimits = wordCount >= minWords && wordCount <= maxWords;
  const canSubmit = wordCount >= minWords;

  // Submit for evaluation
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsEvaluating(true);
    setError(null);

    try {
      const keyPoints = extractKeyPoints(segment.text);
      const prompt = buildSummaryEvaluationPrompt(
        segment.text,
        userSummary,
        keyPoints,
        100
      );

      const response = await evaluateAnswer({ message: prompt }).unwrap();

      // Parse response
      const evalResult: AIEvaluation = {
        score: response.score || 0,
        maxScore: response.maxScore || 100,
        feedback: response.feedback || 'Your summary has been evaluated.',
        mainIdeaCaptured: response.isCorrect || false,
        strengths: response.strengths,
        improvements: response.improvements,
        suggestions: response.suggestions,
      };

      // Try to parse additional fields from message if raw
      if (response.raw && response.message) {
        try {
          const parsed = JSON.parse(response.message);
          Object.assign(evalResult, {
            coveredKeyPoints: parsed.coveredKeyPoints,
            missingPoints: parsed.missingPoints,
            grammarIssues: parsed.grammarIssues,
          });
        } catch {
          // Keep default values
        }
      }

      setEvaluation(evalResult);
    } catch (err) {
      console.error('Error evaluating summary:', err);
      setError('Failed to evaluate summary. Please try again.');

      // Fallback evaluation
      setEvaluation({
        score: 50,
        maxScore: 100,
        feedback:
          'Your summary has been submitted. Keep practicing to improve your summarization skills!',
        mainIdeaCaptured: wordCount >= minWords,
        suggestions: [
          'Make sure to capture the main idea',
          'Include key details from the passage',
        ],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset exercise
  const handleReset = () => {
    setUserSummary('');
    setEvaluation(null);
    setError(null);
  };

  // Complete exercise
  const handleComplete = () => {
    const answer: ParagraphSummaryAnswer = {
      exerciseId: segment.id,
      userSummary,
      wordCount,
      aiEvaluation: evaluation
        ? {
            score: evaluation.score,
            maxScore: evaluation.maxScore,
            feedback: evaluation.feedback,
            mainIdeaCaptured: evaluation.mainIdeaCaptured,
            missingPoints: evaluation.missingPoints || [],
            grammarIssues: evaluation.grammarIssues,
            suggestions: evaluation.suggestions || [],
          }
        : undefined,
      timeSpent: Date.now() - startTime,
    };

    onComplete(answer);
  };

  // Play TTS for original text
  const handlePlayTTS = () => {
    if (enableTTS) {
      tts.play(segment.text);
    }
  };

  // Calculate score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <PenLine className="w-5 h-5 text-indigo-500" />
            Summary Writing
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
            <Badge variant="outline">
              {minWords}-{maxWords} words
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Read the passage and write a concise summary
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Original Text */}
        <div className="p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Original Passage
              </span>
            </div>
            {enableTTS && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayTTS}
                disabled={tts.isLoading || tts.isPlaying}
                className="h-7"
              >
                <Volume2
                  className={cn(
                    'w-3 h-3 mr-1',
                    tts.isPlaying && 'animate-pulse'
                  )}
                />
                Listen
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {segment.text}
          </p>
        </div>

        {/* Writing Guidelines */}
        <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg">
          <Target className="w-4 h-4 text-indigo-600 mt-0.5" />
          <div className="text-sm text-indigo-700">
            <p className="font-medium mb-1">Writing Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-indigo-600">
              <li>Capture the main idea of the passage</li>
              <li>Use your own words (paraphrase)</li>
              <li>
                Keep it between {minWords}-{maxWords} words
              </li>
              <li>Include important details</li>
            </ul>
          </div>
        </div>

        {/* Summary Input */}
        {!evaluation && (
          <div className="space-y-2">
            <Textarea
              value={userSummary}
              onChange={(e) => setUserSummary(e.target.value)}
              placeholder="Write your summary here..."
              className="min-h-[120px] resize-none"
              disabled={isEvaluating}
            />

            {/* Word Count */}
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  'flex items-center gap-1',
                  wordCount < minWords && 'text-amber-600',
                  wordCount > maxWords && 'text-red-600',
                  isWithinLimits && 'text-green-600'
                )}
              >
                {wordCount < minWords && <AlertCircle className="w-3 h-3" />}
                {wordCount > maxWords && <XCircle className="w-3 h-3" />}
                {isWithinLimits && <CheckCircle className="w-3 h-3" />}
                {wordCount} words
              </span>
              <span className="text-muted-foreground">
                Target: {minWords}-{maxWords} words
              </span>
            </div>

            <Progress
              value={Math.min((wordCount / maxWords) * 100, 100)}
              className="h-2"
            />
          </div>
        )}

        {/* Evaluation Results */}
        {evaluation && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold',
                    evaluation.score >= 80
                      ? 'bg-green-100'
                      : evaluation.score >= 60
                        ? 'bg-blue-100'
                        : evaluation.score >= 40
                          ? 'bg-yellow-100'
                          : 'bg-red-100',
                    getScoreColor(evaluation.score)
                  )}
                >
                  {evaluation.score}
                </div>
                <div>
                  <p className="font-medium">Your Score</p>
                  <p className="text-sm text-muted-foreground">
                    out of {evaluation.maxScore}
                  </p>
                </div>
              </div>

              {evaluation.mainIdeaCaptured ? (
                <Badge className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Main Idea Captured
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Needs Improvement
                </Badge>
              )}
            </div>

            {/* Your Summary */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700 mb-1">
                Your Summary:
              </p>
              <p className="text-sm text-gray-700">{userSummary}</p>
            </div>

            {/* Feedback */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Feedback</p>
                  <p className="text-sm text-gray-600">{evaluation.feedback}</p>
                </div>
              </div>

              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Strengths
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {evaluation.improvements &&
                evaluation.improvements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Areas for Improvement
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                      {evaluation.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Suggestions */}
              {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" /> Suggestions
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 ml-4">
                    {evaluation.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            {!evaluation ? (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isEvaluating}
                className="gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {wordCount > maxWords
                      ? 'Submit (Over limit)'
                      : 'Submit for Review'}
                  </>
                )}
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

          {evaluation && (
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

export default ParagraphSummaryExercise;
