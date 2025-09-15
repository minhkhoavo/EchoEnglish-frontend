import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';

interface Part1QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part1Question = ({
  part,
  showCorrectAnswers = false,
}: Part1QuestionProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );
  const [expandedTranscripts, setExpandedTranscripts] = useState<number[]>([]);
  const [expandedTranslations, setExpandedTranslations] = useState<number[]>(
    []
  );

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Function to get user answer (mock for history view, Redux for current test)
  const getUserAnswer = (questionNumber: number) => {
    if (showCorrectAnswers) {
      // Return mock answer for history view
      const mockAnswers: { [key: number]: string } = {
        1: 'A',
        2: 'C',
        3: 'B',
        4: 'D',
        5: 'C',
        6: 'C',
      };
      return mockAnswers[questionNumber] || null;
    }
    // Return actual user answer from Redux for current test
    return getAnswer(questionNumber);
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

  const toggleTranscript = (questionNumber: number) => {
    setExpandedTranscripts((prev) =>
      prev.includes(questionNumber)
        ? prev.filter((num) => num !== questionNumber)
        : [...prev, questionNumber]
    );
  };

  const toggleTranslation = (questionNumber: number) => {
    setExpandedTranslations((prev) =>
      prev.includes(questionNumber)
        ? prev.filter((num) => num !== questionNumber)
        : [...prev, questionNumber]
    );
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
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> For each question in this part, you
            will hear four statements about a picture in your test book. When
            you hear the statements, you must select the one statement that best
            describes what you see in the picture. Then find the number of the
            question on your answer sheet and mark your answer. The statements
            will not be printed in your test book and will be spoken only one
            time.
          </p>
        </CardContent>
      </Card>

      {/* All Questions */}
      <div className="space-y-8">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswer(question.questionNumber);
          const isCorrect =
            showCorrectAnswers && userAnswer === question.correctAnswer;
          const isExplanationExpanded = expandedExplanations.includes(
            question.questionNumber
          );
          const isTranscriptExpanded = expandedTranscripts.includes(
            question.questionNumber
          );
          const isTranslationExpanded = expandedTranslations.includes(
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
                      expanded={isTranscriptExpanded}
                      onToggle={() => toggleTranscript(question.questionNumber)}
                      explanation={question.media?.transcript || ''}
                    />
                  )}

                  {/* Translation Section (if available) */}
                  {/* TODO: tách TranslationSection thành component riêng nếu muốn dùng chung cho các part */}
                  {showCorrectAnswers && question.media.translation && (
                    <ExplanationSection
                      expanded={isTranslationExpanded}
                      onToggle={() =>
                        toggleTranslation(question.questionNumber)
                      }
                      explanation={question.media.translation}
                    />
                  )}

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

                {/* Question and Options */}
                <div className="space-y-4">
                  <AnswerOptions
                    options={question.options}
                    userAnswer={userAnswer ?? undefined}
                    correctAnswer={question.correctAnswer}
                    showCorrectAnswers={showCorrectAnswers}
                    onSelect={(label) =>
                      handleAnswerSelect(question.questionNumber, label)
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
