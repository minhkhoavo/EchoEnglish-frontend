import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';
interface Part5QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part5Question = ({
  part,
  showCorrectAnswers = false,
}: Part5QuestionProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Function to get user answer (mock for history view, Redux for current test)
  const getUserAnswer = (questionNumber: number) => {
    if (showCorrectAnswers) {
      // Return mock answer for history view
      const mockAnswers: { [key: number]: string } = {
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
      return mockAnswers[questionNumber] || '';
    }
    // Use Redux to get current test answer
    return getAnswer(questionNumber) || '';
  };

  // Handle answer selection
  const handleAnswerSelect = (questionNumber: number, answer: string) => {
    if (!showCorrectAnswers) {
      saveAnswer(questionNumber, answer);
    }
  };

  const toggleExplanation = (questionNumber: number) => {
    setExpandedExplanations((prev) =>
      prev.includes(questionNumber)
        ? prev.filter((num) => num !== questionNumber)
        : [...prev, questionNumber]
    );
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
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> A word or phrase is missing in each
            of the sentences below. Four answer choices are given below each
            sentence. Select the best answer to complete the sentence.
          </p>
        </CardContent>
      </Card>

      {/* All Questions */}
      <div className="space-y-6">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswer(question.questionNumber);
          const isCorrect = userAnswer === question.correctAnswer;
          const isExplanationExpanded = expandedExplanations.includes(
            question.questionNumber
          );

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
                      handleAnswerSelect(question.questionNumber, label)
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
