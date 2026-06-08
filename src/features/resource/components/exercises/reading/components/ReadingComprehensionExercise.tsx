/**
 * ReadingComprehensionExercise Component
 *
 * Bài tập đọc hiểu - Câu hỏi trắc nghiệm được tạo bởi AI
 *
 * Phương pháp giáo dục:
 * - Phát triển kỹ năng suy luận (inference)
 * - Nắm bắt ý chính (main idea)
 * - Hiểu chi tiết (detail comprehension)
 * - Học từ vựng trong ngữ cảnh
 * - Phân tích mục đích tác giả
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  Brain,
  Loader2,
  RefreshCw,
  Eye,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTTS } from '../hooks/useTTS';
import {
  useGenerateExerciseQuestionsMutation,
  buildComprehensionPrompt,
} from '../services/readingExerciseApi';
import type {
  ComprehensionExercise,
  ComprehensionQuestion,
  ComprehensionAnswer,
  ReadingDifficulty,
} from '../types/reading-exercise.types';

// ============================================================================
// TYPES
// ============================================================================

interface ReadingComprehensionExerciseProps {
  segment: {
    id: string;
    text: string;
    sentences: string[];
  };
  difficulty: ReadingDifficulty;
  questionCount?: number;
  onComplete: (answer: ComprehensionAnswer) => void;
  onSkip?: () => void;
  enableTTS?: boolean;
  className?: string;
}

interface QuestionState {
  question: ComprehensionQuestion;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  isAnswered: boolean;
  timeSpent: number;
}

// ============================================================================
// QUESTION TYPE ICONS & LABELS
// ============================================================================

const QUESTION_TYPE_INFO: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  main_idea: {
    icon: '🎯',
    label: 'Main Idea',
    color: 'bg-purple-100 text-purple-700',
  },
  detail: { icon: '🔍', label: 'Detail', color: 'bg-blue-100 text-blue-700' },
  inference: {
    icon: '💭',
    label: 'Inference',
    color: 'bg-green-100 text-green-700',
  },
  vocabulary: {
    icon: '📚',
    label: 'Vocabulary',
    color: 'bg-yellow-100 text-yellow-700',
  },
  author_purpose: {
    icon: '✍️',
    label: 'Author Purpose',
    color: 'bg-pink-100 text-pink-700',
  },
  cause_effect: {
    icon: '⚡',
    label: 'Cause & Effect',
    color: 'bg-orange-100 text-orange-700',
  },
  sequence: {
    icon: '📋',
    label: 'Sequence',
    color: 'bg-teal-100 text-teal-700',
  },
  comparison: {
    icon: '⚖️',
    label: 'Compare/Contrast',
    color: 'bg-indigo-100 text-indigo-700',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ReadingComprehensionExercise: React.FC<
  ReadingComprehensionExerciseProps
> = ({
  segment,
  difficulty,
  questionCount = 5,
  onComplete,
  onSkip,
  enableTTS = true,
  className,
}) => {
  // State
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [startTime] = useState(Date.now());

  // API Hooks
  const [generateQuestions] = useGenerateExerciseQuestionsMutation();

  // TTS Hook
  const tts = useTTS();

  // Current question
  const currentQuestion = questions[currentIndex];

  // Fallback questions if AI fails - defined before fetchQuestions
  const generateFallbackQuestions = useCallback(() => {
    const sentences = segment.text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim());
    const fallbackQuestions: ComprehensionQuestion[] = [
      {
        id: 'q1',
        questionType: 'main_idea',
        question: 'What is the main topic of this passage?',
        options: [
          {
            id: 'a',
            text: 'The content discusses a specific topic',
            isCorrect: true,
          },
          { id: 'b', text: 'An unrelated topic', isCorrect: false },
          { id: 'c', text: 'A completely different subject', isCorrect: false },
          { id: 'd', text: 'None of the above', isCorrect: false },
        ],
        explanation:
          'The main idea can be found by identifying the central theme discussed throughout the passage.',
      },
      {
        id: 'q2',
        questionType: 'detail',
        question: `According to the passage, what information is provided in the first sentence?`,
        options: [
          {
            id: 'a',
            text:
              sentences[0]?.slice(0, 50) + '...' || 'Information from the text',
            isCorrect: true,
          },
          { id: 'b', text: 'Different information', isCorrect: false },
          { id: 'c', text: 'Unrelated details', isCorrect: false },
          { id: 'd', text: 'None of the above', isCorrect: false },
        ],
        explanation: 'This detail is directly stated in the passage.',
        relatedTextPortion: sentences[0],
      },
    ];

    setQuestions(
      fallbackQuestions.map((q) => ({
        question: q,
        selectedOptionId: null,
        isCorrect: null,
        isAnswered: false,
        timeSpent: 0,
      }))
    );
  }, [segment.text]);

  // Generate questions using AI
  const fetchQuestions = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildComprehensionPrompt(
        segment.text,
        difficulty,
        questionCount
      );
      const response = await generateQuestions({ message: prompt }).unwrap();

      if (response.questions && response.questions.length > 0) {
        setQuestions(
          response.questions.map((q) => ({
            question: q,
            selectedOptionId: null,
            isCorrect: null,
            isAnswered: false,
            timeSpent: 0,
          }))
        );
        setCurrentIndex(0);
        setQuestionStartTime(Date.now());
      } else if (response.raw && response.message) {
        // Try to parse raw message
        try {
          const parsed = JSON.parse(response.message);
          if (parsed.questions) {
            setQuestions(
              parsed.questions.map((q: ComprehensionQuestion) => ({
                question: q,
                selectedOptionId: null,
                isCorrect: null,
                isAnswered: false,
                timeSpent: 0,
              }))
            );
            setCurrentIndex(0);
            setQuestionStartTime(Date.now());
          }
        } catch {
          throw new Error('Failed to parse AI response');
        }
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      setError('Failed to generate questions. Please try again.');
      // Generate fallback questions
      generateFallbackQuestions();
    } finally {
      setIsGenerating(false);
    }
  }, [
    segment.text,
    difficulty,
    questionCount,
    generateQuestions,
    generateFallbackQuestions,
  ]);

  // Load questions on mount or when segment changes
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (currentQuestion?.isAnswered) return;

    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, selectedOptionId: optionId } : q
      )
    );
  };

  // Submit answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !currentQuestion.selectedOptionId) return;

    const selectedOption = currentQuestion.question.options.find(
      (o) => o.id === currentQuestion.selectedOptionId
    );
    const isCorrect = selectedOption?.isCorrect || false;
    const timeSpent = Date.now() - questionStartTime;

    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex
          ? { ...q, isAnswered: true, isCorrect, timeSpent }
          : q
      )
    );
    setShowExplanation(true);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      // Complete exercise
      handleComplete();
    }
  };

  // Navigate to previous question
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(questions[currentIndex - 1]?.isAnswered || false);
    }
  };

  // Complete exercise
  const handleComplete = () => {
    const answeredQuestions = questions.filter((q) => q.isAnswered);
    const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;

    const answer: ComprehensionAnswer = {
      exerciseId: segment.id,
      answers: questions.map((q) => ({
        questionId: q.question.id,
        selectedOptionId: q.selectedOptionId || '',
        isCorrect: q.isCorrect || false,
        timeSpent: q.timeSpent,
      })),
      totalScore: correctCount,
      maxScore: questions.length,
    };

    onComplete(answer);
  };

  // Play question TTS
  const handlePlayQuestion = () => {
    if (enableTTS && currentQuestion) {
      tts.play(currentQuestion.question.question);
    }
  };

  // Calculate progress
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const progress = Math.round(
    (answeredCount / Math.max(questions.length, 1)) * 100
  );

  // Loading state
  if (isGenerating) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">
            Generating comprehension questions...
          </p>
          <p className="text-sm text-muted-foreground">
            Our AI is analyzing the text
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <X className="w-8 h-8 text-red-500" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchQuestions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Reading Comprehension
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
              {currentIndex + 1}/{questions.length}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Answer the questions based on the passage
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {answeredCount}/{questions.length} answered • {correctCount}{' '}
              correct
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Passage Preview */}
        <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Passage</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {segment.text.length > 300
              ? segment.text.slice(0, 300) + '...'
              : segment.text}
          </p>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="space-y-4">
            {/* Question Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      'text-xs',
                      QUESTION_TYPE_INFO[currentQuestion.question.questionType]
                        ?.color || 'bg-gray-100'
                    )}
                  >
                    {
                      QUESTION_TYPE_INFO[currentQuestion.question.questionType]
                        ?.icon
                    }{' '}
                    {QUESTION_TYPE_INFO[currentQuestion.question.questionType]
                      ?.label || 'Question'}
                  </Badge>
                  {enableTTS && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayQuestion}
                      className="h-6 px-2"
                    >
                      <Volume2
                        className={cn(
                          'w-3 h-3',
                          tts.isPlaying && 'animate-pulse'
                        )}
                      />
                    </Button>
                  )}
                </div>
                <p className="font-medium text-base">
                  {currentQuestion.question.question}
                </p>
              </div>
            </div>

            {/* Related Text Portion */}
            {currentQuestion.question.relatedTextPortion && showExplanation && (
              <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-700 italic">
                  "{currentQuestion.question.relatedTextPortion}"
                </p>
              </div>
            )}

            {/* Options */}
            <RadioGroup
              value={currentQuestion.selectedOptionId || ''}
              onValueChange={handleOptionSelect}
              className="space-y-2"
            >
              {currentQuestion.question.options.map((option) => {
                const isSelected =
                  currentQuestion.selectedOptionId === option.id;
                const showResult = currentQuestion.isAnswered;

                return (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer',
                      !showResult && isSelected && 'border-blue-500 bg-blue-50',
                      !showResult &&
                        !isSelected &&
                        'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                      showResult &&
                        option.isCorrect &&
                        'border-green-500 bg-green-50',
                      showResult &&
                        !option.isCorrect &&
                        isSelected &&
                        'border-red-500 bg-red-50',
                      showResult &&
                        !option.isCorrect &&
                        !isSelected &&
                        'opacity-60',
                      showResult && 'cursor-default'
                    )}
                    onClick={() => !showResult && handleOptionSelect(option.id)}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      disabled={currentQuestion.isAnswered}
                      className={cn(
                        showResult &&
                          option.isCorrect &&
                          'border-green-500 text-green-500',
                        showResult &&
                          !option.isCorrect &&
                          isSelected &&
                          'border-red-500 text-red-500'
                      )}
                    />
                    <Label
                      htmlFor={option.id}
                      className={cn(
                        'flex-1 cursor-pointer text-sm',
                        showResult && 'cursor-default'
                      )}
                    >
                      {option.text}
                    </Label>
                    {showResult && option.isCorrect && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                    {showResult && !option.isCorrect && isSelected && (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                );
              })}
            </RadioGroup>

            {/* Explanation */}
            {showExplanation && currentQuestion.isAnswered && (
              <div
                className={cn(
                  'p-4 rounded-lg',
                  currentQuestion.isCorrect ? 'bg-green-50' : 'bg-amber-50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {currentQuestion.isCorrect ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">
                        Correct!
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-amber-700">
                        Not quite right
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    {currentQuestion.question.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {onSkip && (
              <Button variant="ghost" onClick={onSkip}>
                Skip Exercise
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentQuestion && !currentQuestion.isAnswered ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentQuestion.selectedOptionId}
              >
                <Check className="w-4 h-4 mr-1" />
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Complete
                    <Check className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Question Dots Navigation */}
        <div className="flex justify-center gap-1 pt-2">
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setShowExplanation(q.isAnswered);
              }}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                idx === currentIndex && 'ring-2 ring-blue-400 ring-offset-1',
                !q.isAnswered && 'bg-gray-300',
                q.isAnswered && q.isCorrect && 'bg-green-500',
                q.isAnswered && !q.isCorrect && 'bg-red-500'
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingComprehensionExercise;
