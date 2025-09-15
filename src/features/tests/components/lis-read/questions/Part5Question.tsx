import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';
import { Instructions } from '../common/Instructions';
import { useExpanded } from '@/features/tests/hooks/useExpanded';
import {
  getUserAnswer,
  handleAnswerSelect,
} from '@/features/tests/utils/answerUtils';
interface Part5QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part5Question = ({
  part,
  showCorrectAnswers = false,
}: Part5QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Mock data for history view
  const mockAnswers: Record<number, string> = {
    101: 'B',
    102: 'D',
    103: 'C',
    104: 'A',
    105: 'B',
    106: 'C',
    107: 'A',
    108: 'D',
    109: 'B',
    110: 'A',
    111: 'C',
    112: 'B',
    113: 'D',
    114: 'A',
    115: 'C',
    116: 'B',
    117: 'D',
    118: 'A',
    119: 'C',
    120: 'B',
    121: 'D',
    122: 'A',
    123: 'C',
    124: 'B',
    125: 'D',
    126: 'A',
    127: 'C',
    128: 'B',
    129: 'D',
    130: 'A',
  };

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
          const userAnswer = getUserAnswer(
            showCorrectAnswers,
            getAnswer,
            question.questionNumber,
            mockAnswers
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
                    />
                  )}
                </div>

                {/* Question and Options - Right side */}
                <div className="space-y-4">
                  {/* Question Text */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">
                        Sentence Completion
                      </h3>
                      <div className="text-base leading-relaxed">
                        {(question.questionText || '')
                          .split('--')
                          .map((part, index, array) => (
                            <React.Fragment key={index}>
                              {part}
                              {index < array.length - 1 && (
                                <span className="inline-block w-16 h-6 bg-yellow-200 dark:bg-yellow-800 border-b-2 border-yellow-600 mx-1 align-bottom">
                                  ______
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

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
