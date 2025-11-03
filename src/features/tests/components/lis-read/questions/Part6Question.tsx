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

interface Part6QuestionProps {
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

export const Part6Question = ({
  part,
  showCorrectAnswers = false,
  userAnswers = {},
  reviewAnswers = [],
  resourceUrl,
}: Part6QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  const toggleTranslation = (groupIndex: number) => {
    toggleExpanded(groupIndex + 2000);
  };

  return (
    <div className="space-y-6">
      {/* Part Header */}
      <QuestionHeader
        partName={part.partName}
        range={[
          part.questionGroups?.[0]?.questions?.[0]?.questionNumber || 1,
          part.questionGroups?.[part.questionGroups.length - 1]?.questions?.[
            part.questionGroups[part.questionGroups.length - 1]?.questions
              ?.length - 1
          ]?.questionNumber || 1,
        ]}
      />

      {/* Part Instructions */}
      <Instructions>
        <strong>Instructions:</strong> Read the texts that follow. A word,
        phrase, or sentence is missing in parts of each text. Four answer
        choices for each question are given below the text. Select the best
        answer to complete the text.
      </Instructions>

      {/* Question Groups */}
      <div className="space-y-8">
        {part.questionGroups?.map((group, groupIndex) => (
          <div key={groupIndex} className="border rounded-lg p-6 bg-background">
            {/* Group Header */}
            <QuestionHeader
              range={[
                group.questions[0]?.questionNumber,
                group.questions[group.questions.length - 1]?.questionNumber,
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Passage and Context */}
              <div className="space-y-4">
                {/* Images if available */}
                {group.groupContext.imageUrls &&
                  group.groupContext.imageUrls.length > 0 &&
                  group.groupContext.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Question group ${groupIndex + 1} image ${index + 1}`}
                        className="w-full rounded-lg shadow-sm border"
                      />
                    </div>
                  ))}

                {/* Passage with blanks - only show if no images */}
                {(!group.groupContext.imageUrls ||
                  group.groupContext.imageUrls.length === 0) && (
                  <QuestionContent
                    title="Reading Passage"
                    content={group.groupContext?.passageHtml || ''}
                    resourceUrl={resourceUrl}
                    isHtml={true}
                    showCorrectAnswers={showCorrectAnswers}
                  />
                )}

                {/* Translation Section */}
                {showCorrectAnswers &&
                  (group.groupContext.translation ||
                    group.groupContext.transcript) && (
                    <ExplanationSection
                      title="Show Translation"
                      expanded={isExpanded(groupIndex + 2000)}
                      onToggle={() => toggleTranslation(groupIndex)}
                      explanation={
                        group.groupContext?.translation ||
                        group.groupContext?.transcript ||
                        ''
                      }
                      showCorrectAnswers={showCorrectAnswers}
                    />
                  )}
              </div>

              {/* Questions and Options */}
              <div
                className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6',
                }}
              >
                {group.questions.map((question) => {
                  const userAnswer = getUserAnswerUnified(
                    showCorrectAnswers,
                    getAnswer,
                    question.questionNumber,
                    reviewAnswers,
                    userAnswers
                  );
                  const isExplanationExpanded = isExpanded(
                    question.questionNumber
                  );
                  return (
                    <div
                      key={question.questionNumber}
                      id={`question-${question.questionNumber}`}
                      className="border rounded-lg p-4 bg-card"
                    >
                      <QuestionHeader
                        questionNumber={question.questionNumber}
                      />
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
                      {/* Explanation */}
                      {showCorrectAnswers && (
                        <ExplanationSection
                          title="Show Explanation"
                          expanded={isExplanationExpanded}
                          onToggle={() =>
                            toggleExpanded(question.questionNumber)
                          }
                          explanation={question.explanation}
                          resourceUrl={resourceUrl}
                          showCorrectAnswers={showCorrectAnswers}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
