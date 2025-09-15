import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';

interface Part7QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part7Question = ({
  part,
  showCorrectAnswers = false,
}: Part7QuestionProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );
  const [expandedTranslations, setExpandedTranslations] = useState<number[]>(
    []
  );

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Function to get user answer
  const getUserAnswer = (questionNumber: number) => {
    if (showCorrectAnswers) {
      // Return mock answer for history view
      return ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    }
    return getAnswer(questionNumber);
  };

  // Handle answer selection
  const handleAnswerSelect = (
    questionNumber: number,
    selectedAnswer: string
  ) => {
    if (!showCorrectAnswers) {
      saveAnswer(questionNumber, selectedAnswer);
    }
  };

  // Toggle explanation
  const toggleExplanation = (questionNumber: number) => {
    setExpandedExplanations((prev) =>
      prev.includes(questionNumber)
        ? prev.filter((id) => id !== questionNumber)
        : [...prev, questionNumber]
    );
  };

  // Toggle translation
  const toggleTranslation = (groupIndex: number) => {
    setExpandedTranslations((prev) =>
      prev.includes(groupIndex)
        ? prev.filter((id) => id !== groupIndex)
        : [...prev, groupIndex]
    );
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
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> In this part you will read a
            selection of texts, such as magazine and newspaper articles,
            e-mails, memos, instant messages, advertisements, and notices. Each
            text or set of texts is followed by several questions. Select the
            best answer for each question and mark the letter (A), (B), (C), or
            (D) on your answer sheet.
          </p>
        </CardContent>
      </Card>

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
                      expanded={expandedTranslations.includes(groupIndex)}
                      onToggle={() => toggleTranslation(groupIndex)}
                      explanation={
                        group.groupContext.translation ||
                        group.groupContext.transcript ||
                        ''
                      }
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
                  const userAnswer = getUserAnswer(question.questionNumber);
                  const isExplanationExpanded = expandedExplanations.includes(
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
                          handleAnswerSelect(question.questionNumber, label)
                        }
                      />

                      {/* Explanation */}
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
