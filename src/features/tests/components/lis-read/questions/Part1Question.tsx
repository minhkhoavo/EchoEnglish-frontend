import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';
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

interface Part1QuestionProps {
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

export const Part1Question = ({
  part,
  showCorrectAnswers = false,
  userAnswers = {},
  reviewAnswers = [],
  resourceUrl,
}: Part1QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  const toggleTranscript = (questionNumber: number) => {
    toggleExpanded(questionNumber + 1000); // Add offset to avoid collision
  };

  const toggleTranslation = (questionNumber: number) => {
    toggleExpanded(questionNumber + 2000); // Add offset to avoid collision
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
        <strong>Instructions:</strong> For each question in this part, you will
        hear four statements about a picture in your test book. When you hear
        the statements, you must select the one statement that best describes
        what you see in the picture. Then find the number of the question on
        your answer sheet and mark your answer. The statements will not be
        printed in your test book and will be spoken only one time.
      </Instructions>

      {/* All Questions */}
      <div className="space-y-8">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswerUnified(
            showCorrectAnswers,
            getAnswer,
            question.questionNumber,
            reviewAnswers,
            userAnswers
          );
          const isCorrect =
            showCorrectAnswers && userAnswer === question.correctAnswer;
          const isExplanationExpanded = isExpanded(question.questionNumber);
          const isTranscriptExpanded = isExpanded(
            question.questionNumber + 1000
          );
          const isTranslationExpanded = isExpanded(
            question.questionNumber + 2000
          );

          return (
            <div
              key={question.questionNumber}
              id={`question-${question.questionNumber}`}
              className="border rounded-lg p-6 bg-background"
            >
              {/* Question Header */}
              <QuestionHeader questionNumber={question.questionNumber} />

              {/* Audio Player */}
              <div className="mb-6">
                <AudioPlayer audioUrl={question.media?.audioUrl || ''} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image */}
                <div className="space-y-4">
                  {question.media.imageUrls?.map(
                    (imageUrl: string, index: number) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Question ${question.questionNumber} image ${index + 1}`}
                          className="w-full rounded-lg shadow-sm border"
                        />
                      </div>
                    )
                  )}

                  {/* Transcript Section */}
                  {/* TODO: tách TranscriptSection thành component riêng nếu muốn dùng chung cho các part */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Transcript"
                      expanded={isTranscriptExpanded}
                      onToggle={() => toggleTranscript(question.questionNumber)}
                      explanation={question.media?.transcript || ''}
                      showCorrectAnswers={showCorrectAnswers}
                    />
                  )}

                  {/* Translation Section (if available) */}
                  {/* TODO: tách TranslationSection thành component riêng nếu muốn dùng chung cho các part */}
                  {showCorrectAnswers && question.media.translation && (
                    <ExplanationSection
                      title="Show Translation"
                      expanded={isTranslationExpanded}
                      onToggle={() =>
                        toggleTranslation(question.questionNumber)
                      }
                      explanation={question.media.translation}
                      resourceUrl={resourceUrl}
                      showCorrectAnswers={showCorrectAnswers}
                    />
                  )}

                  {/* Explanation Section */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Explanation"
                      expanded={isExplanationExpanded}
                      onToggle={() => toggleExpanded(question.questionNumber)}
                      explanation={question.explanation}
                      resourceUrl={resourceUrl}
                      showCorrectAnswers={showCorrectAnswers}
                    />
                  )}
                </div>

                {/* Question and Options */}
                <div className="space-y-4">
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
                    listening={true}
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
