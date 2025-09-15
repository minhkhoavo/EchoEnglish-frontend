import { useState } from 'react';
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
} from '@/features/tests/utils/answerUtils';

interface Part2QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part2Question = ({
  part,
  showCorrectAnswers = false,
}: Part2QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Mock data for history view
  const mockAnswers: Record<number, string> = {
    7: 'C',
    8: 'C',
    9: 'C',
    10: 'A',
    11: 'C',
    12: 'C',
    13: 'C',
    14: 'A',
    15: 'B',
    16: 'C',
    17: 'A',
    18: 'B',
    19: 'C',
    20: 'A',
    21: 'B',
    22: 'C',
    23: 'A',
    24: 'B',
    25: 'C',
    26: 'A',
    27: 'B',
    28: 'C',
    29: 'A',
    30: 'B',
    31: 'C',
  };

  const toggleExplanation = (questionNumber: number) => {
    toggleExpanded(questionNumber);
  };

  const toggleTranscript = (questionNumber: number) => {
    toggleExpanded(questionNumber + 1000);
  };

  const toggleTranslation = (questionNumber: number) => {
    toggleExpanded(questionNumber + 2000);
  };

  const scrollToQuestion = (questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        <strong>Instructions:</strong> You will hear a question or statement and
        three responses spoken in English. They will not be printed in your test
        book and will be spoken only one time. Select the best response to the
        question or statement and mark the letter (A), (B), or (C) on your
        answer sheet.
      </Instructions>

      {/* All Questions */}
      <div className="space-y-8">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswer(
            showCorrectAnswers,
            getAnswer,
            question.questionNumber,
            mockAnswers
          );
          const isCorrect = userAnswer === question.correctAnswer;
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
                {/* Left: Explanation and Transcript */}
                <div className="space-y-4">
                  {/* Transcript Section */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Transcript"
                      expanded={isTranscriptExpanded}
                      onToggle={() => toggleTranscript(question.questionNumber)}
                      explanation={question.media?.transcript || ''}
                    />
                  )}

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

                  {/* Translation Section (if available) */}
                  {showCorrectAnswers && question.media?.translation && (
                    <ExplanationSection
                      title="Show Translation"
                      expanded={isTranslationExpanded}
                      onToggle={() =>
                        toggleTranslation(question.questionNumber)
                      }
                      explanation={question.media?.translation || ''}
                    />
                  )}

                  {/* End of left column */}
                </div>
                {/* Right: Question and Options */}
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
