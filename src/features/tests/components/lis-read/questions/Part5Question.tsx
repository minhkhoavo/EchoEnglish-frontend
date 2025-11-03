import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';
import { QuestionContent } from '../common/QuestionContent';
import { Instructions } from '../common/Instructions';
import { useExpanded } from '@/features/tests/hooks/useExpanded';
import {
  getUserAnswer,
  handleAnswerSelect,
  getUserAnswerUnified,
} from '@/features/tests/utils/answerUtils';
interface Part5QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
  userAnswers?: Record<number, string>; // For review mode
  reviewAnswers?: Array<{
    questionNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }>;
  resourceUrl?: string;
}

export const Part5Question = ({
  part,
  showCorrectAnswers = false,
  userAnswers = {},
  reviewAnswers = [],
  resourceUrl,
}: Part5QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  const toggleExplanation = (questionNumber: number) => {
    toggleExpanded(questionNumber);
  };

  return (
    <div className="space-y-6">
      {/* Part Header */}
      <QuestionHeader
        partName={part.partName}
        range={[
          part.questions?.[0]?.questionNumber || 1,
          part.questions?.[part.questions.length - 1]?.questionNumber || 1,
        ]}
      />

      {/* Part Instructions */}
      <Instructions>
        <strong>Instructions:</strong> A word or phrase is missing in each of
        the sentences below. Four answer choices are given below each sentence.
        Select the best answer to complete the sentence.
      </Instructions>

      {/* All Questions */}
      <div className="space-y-6">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswerUnified(
            showCorrectAnswers,
            getAnswer,
            question.questionNumber,
            reviewAnswers,
            userAnswers
          );
          const isCorrect = userAnswer === question.correctAnswer;
          const isExplanationExpanded = isExpanded(question.questionNumber);

          return (
            <div
              key={question.questionNumber}
              id={`question-${question.questionNumber}`}
              className="border rounded-lg p-6 bg-background"
            >
              {/* Question Header */}
              <QuestionHeader questionNumber={question.questionNumber} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Explanation and Summary - Left side */}
                <div className="space-y-4">
                  {/* Explanation Section */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Explanation"
                      expanded={isExplanationExpanded}
                      onToggle={() =>
                        toggleExplanation(question.questionNumber)
                      }
                      explanation={question.explanation}
                      resourceUrl={resourceUrl}
                    />
                  )}
                </div>

                {/* Question and Options - Right side */}
                <div className="space-y-4">
                  {/* Question Text */}
                  <QuestionContent
                    title="Sentence Completion"
                    content={(question.questionText || '')
                      .split('--')
                      .map(
                        (part, index, array) =>
                          part + (index < array.length - 1 ? ' ______ ' : '')
                      )
                      .join('')}
                    resourceUrl={resourceUrl}
                  />

                  {/* Options - Vertical layout */}
                  <AnswerOptions
                    options={question.options}
                    userAnswer={userAnswer ?? undefined}
                    correctAnswer={question.correctAnswer}
                    showCorrectAnswers={showCorrectAnswers}
                    onSelect={(label) =>
                      handleAnswerSelect(
                        showCorrectAnswers,
                        saveAnswer,
                        question.questionNumber,
                        label
                      )
                    }
                    resourceUrl={resourceUrl}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
