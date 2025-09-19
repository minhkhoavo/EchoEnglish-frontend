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
  getUserAnswerUnified,
} from '@/features/tests/utils/answerUtils';

interface Part7QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
  userAnswers?: Record<number, string>; // For review mode
  reviewAnswers?: Array<{
    questionNumber: number;
    selectedAnswer: string;
    isCorrect: boolean;
    correctAnswer: string;
  }>;
}

export const Part7Question = ({
  part,
  showCorrectAnswers = false,
  userAnswers = {},
  reviewAnswers = [],
}: Part7QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Toggle explanation
  const toggleExplanation = (questionNumber: number) => {
    toggleExpanded(questionNumber);
  };

  // Toggle translation
  const toggleTranslation = (groupIndex: number) => {
    toggleExpanded(groupIndex + 2000);
  };

  return (
    <div className="space-y-6">
      {/* Part Header */}
      <QuestionHeader
        partName={part.partName}
        range={[
          part.questionGroups?.[0]?.questions?.[0]?.questionNumber ?? 1,
          part.questionGroups?.[
            part.questionGroups?.length ? part.questionGroups.length - 1 : 0
          ]?.questions?.[
            part.questionGroups[
              part.questionGroups?.length ? part.questionGroups.length - 1 : 0
            ]?.questions?.length
              ? part.questionGroups[part.questionGroups.length - 1].questions
                  .length - 1
              : 0
          ]?.questionNumber ?? 1,
        ]}
      />

      {/* Part Instructions */}
      <Instructions>
        <strong>Instructions:</strong> In this part you will read a selection of
        texts, such as magazine and newspaper articles, e-mails, memos, instant
        messages, advertisements, and notices. Each text or set of texts is
        followed by several questions. Select the best answer for each question
        and mark the letter (A), (B), (C), or (D) on your answer sheet.
      </Instructions>

      {/* Question Groups */}
      <div className="space-y-8">
        {(part.questionGroups ?? []).map((group, groupIndex) => (
          <div key={groupIndex} className="border rounded-lg p-6 bg-background">
            {/* Group Header */}
            <QuestionHeader
              range={[
                group.questions?.[0]?.questionNumber ?? 1,
                group.questions?.[
                  group.questions?.length ? group.questions.length - 1 : 0
                ]?.questionNumber ?? 1,
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Passage and Context */}
              <div className="space-y-4">
                {/* Images if available */}
                {group.groupContext?.imageUrls &&
                  group.groupContext.imageUrls.length > 0 &&
                  group.groupContext.imageUrls.map(
                    (imageUrl: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Question group ${groupIndex + 1} image ${index + 1}`}
                          className="w-full rounded-lg shadow-sm border"
                        />
                      </div>
                    )
                  )}

                {/* Reading Passage - only show if no images */}
                {(!group.groupContext?.imageUrls ||
                  group.groupContext.imageUrls.length === 0) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">
                        Reading Passage
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: group.groupContext?.passageHtml || '',
                        }}
                        className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Translation Section */}
                {showCorrectAnswers &&
                  (group.groupContext?.translation ||
                    group.groupContext?.transcript) && (
                    <ExplanationSection
                      title="Show Translation"
                      expanded={isExpanded(groupIndex + 2000)}
                      onToggle={() => toggleTranslation(groupIndex)}
                      explanation={(() => {
                        const fullText =
                          group.groupContext.translation ||
                          group.groupContext.transcript ||
                          '';
                        const translationStart = fullText.indexOf(
                          '<p><strong>Dịch nghĩa:</strong></p>'
                        );
                        return translationStart !== -1
                          ? fullText.substring(translationStart)
                          : fullText;
                      })()}
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
                {(group.questions ?? []).map((question) => {
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

                      <div className="mb-4">
                        <p className="text-base font-medium">
                          {question.questionText}
                        </p>
                      </div>

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

                      {/* Explanation */}
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
