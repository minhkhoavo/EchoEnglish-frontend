import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { WritingQuestionProps } from '@/features/tests/types/writing-test.types';

// Import shared components
import { QuestionHeader } from '../QuestionHeader';
import { HelperButtons } from '../HelperButtons';
import {
  IdeasDisplay,
  SampleAnswerDisplay,
  SuggestionsDisplay,
} from '../AnswerDisplays';
import { WritingInput } from '../WritingInput';

// Add part prop to WritingQuestionProps
interface WritingQuestionPropsFixed extends WritingQuestionProps {
  part: {
    direction: { text: string };
    // ...other fields as needed
  };
  absoluteQuestionNumber?: number;
  examMode?: 'practice' | 'exam';
}

export const WritingQuestion: React.FC<WritingQuestionPropsFixed> = ({
  question,
  part,
  partTitle,
  questionIndex,
  totalQuestions,
  onAnswer,
  userAnswer = '',
  isReviewMode = false,
  absoluteQuestionNumber,
  examMode = 'practice',
}) => {
  const [answer, setAnswer] = useState(userAnswer);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [showIdea, setShowIdea] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Sync with userAnswer from Redux when it changes
  useEffect(() => {
    const answerStr = typeof userAnswer === 'string' ? userAnswer : '';
    setAnswer(answerStr);
  }, [userAnswer, question.id]);

  useEffect(() => {
    // Count words in answer
    const answerStr = typeof answer === 'string' ? answer : '';
    const words = answerStr
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    // Auto-save to Redux immediately (so data is in state)
    onAnswer?.(question.id, value);
  };

  const partTitleLower = (partTitle || '').toLowerCase();
  const isEssayQuestion = partTitleLower.includes('essay');
  const isEmailQuestion =
    partTitleLower.includes('email') || partTitleLower.includes('request');
  const isPictureQuestion = partTitleLower.includes('picture');

  return (
    <Card className="w-full border-l-4 border-cyan-500">
      <CardHeader>
        <QuestionHeader
          absoluteQuestionNumber={absoluteQuestionNumber}
          questionIndex={questionIndex}
          title={question.title}
          audioUrl={question.audio || undefined}
          imageUrl={question.image || undefined}
          isEmailQuestion={isEmailQuestion}
          directions={question.directions}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <WritingInput
          answer={typeof answer === 'string' ? answer : ''}
          onAnswerChange={handleAnswerChange}
          isPictureQuestion={isPictureQuestion}
          isEmailQuestion={isEmailQuestion}
          isEssayQuestion={isEssayQuestion}
          wordCount={wordCount}
        />

        {/* Helper Buttons - Only in practice mode */}
        {!isReviewMode && examMode === 'practice' && (
          <div className="flex justify-start items-center">
            <HelperButtons
              hasIdea={!!question.idea}
              hasSampleAnswer={!!question.sample_answer}
              hasSuggestions={!!question.suggestions}
              showIdea={showIdea}
              showSampleAnswer={showSampleAnswer}
              showSuggestions={showSuggestions}
              onToggleIdea={() => setShowIdea(!showIdea)}
              onToggleSampleAnswer={() =>
                setShowSampleAnswer(!showSampleAnswer)
              }
              onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
            />
          </div>
        )}

        {examMode === 'practice' && (
          <>
            <IdeasDisplay idea={question.idea || ''} show={showIdea} />

            <SuggestionsDisplay
              suggestions={question.suggestions || []}
              show={showSuggestions}
            />

            <SampleAnswerDisplay
              sampleAnswer={question.sample_answer || ''}
              show={showSampleAnswer}
              isEmail={isEmailQuestion}
              isEssay={isEssayQuestion}
              suggestions={question.suggestions}
            />
          </>
        )}

        <style>{`
        .email-header strong {
          color: #374151;
          font-weight: 600;
        }
        .email-header br {
          line-height: 1.6;
        }
        .email-sample-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        .email-sample-content p:first-child {
          font-weight: 600;
          color: #065f46;
          border-bottom: 1px solid #d1fae5;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
      `}</style>
      </CardContent>
    </Card>
  );
};
