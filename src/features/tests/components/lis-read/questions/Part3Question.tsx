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

interface Part3QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part3Question = ({
  part,
  showCorrectAnswers = false,
}: Part3QuestionProps) => {
  // Using common useExpanded hook
  const { toggle: toggleExpanded, isExpanded } = useExpanded();

  // Use Redux-based test session management
  const { saveAnswer, getAnswer } = useTestSession();

  // Mock data for history view
  const mockAnswers: Record<number, string> = {
    32: 'D',
    33: 'B',
    34: 'B',
    35: 'A',
    36: 'C',
    37: 'B',
    38: 'D',
    39: 'A',
    40: 'C',
  };

  const toggleTranscript = (groupIndex: number) => {
    toggleExpanded(groupIndex + 3000); // Group level transcript
  };

  const toggleTranslation = (groupIndex: number) => {
    toggleExpanded(groupIndex + 4000); // Group level translation
  };

  const toggleExplanation = (questionNumber: number) => {
    toggleExpanded(questionNumber); // Question level explanation
  };

  const scrollToGroup = (groupIndex: number) => {
    const element = document.getElementById(`group-${groupIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Get all questions for navigation
  const allQuestions =
    part.questionGroups?.flatMap((group) => group.questions) || [];

  return (
    <div className="space-y-6">
      {/* Part Header */}
      <QuestionHeader
        partName={part.partName}
        range={[
          allQuestions[0]?.questionNumber || 1,
          allQuestions[allQuestions.length - 1]?.questionNumber || 1,
        ]}
      />

      {/* Part Instructions */}
      <Instructions>
        <strong>Instructions:</strong> You will hear some conversations between
        two or more people. You will be asked to answer three questions about
        what the speakers say in each conversation. Select the best response to
        each question and mark the letter (A), (B), (C), or (D) on your answer
        sheet. The conversations will not be printed in your test book and will
        be spoken only one time.
      </Instructions>

      {/* All Question Groups */}
      <div className="space-y-12">
        {part.questionGroups?.map((group, groupIndex) => {
          const isTranscriptExpanded = isExpanded(groupIndex + 3000);
          const isTranslationExpanded = isExpanded(groupIndex + 4000);

          return (
            <div
              key={groupIndex}
              id={`group-${groupIndex}`}
              className="border-2 rounded-lg p-6 bg-background"
            >
              {/* Group Header */}
              <QuestionHeader
                range={[
                  group.questions[0].questionNumber,
                  group.questions[group.questions.length - 1].questionNumber,
                ]}
              />

              {/* Audio Player */}
              <div className="mb-6">
                <AudioPlayer audioUrl={group.groupContext?.audioUrl || ''} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Context Information */}
                <div className="space-y-4">
                  {/* Transcript Section */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Transcript"
                      expanded={isTranscriptExpanded}
                      onToggle={() => toggleTranscript(groupIndex)}
                      explanation={group.groupContext?.transcript || ''}
                    />
                  )}

                  {/* Translation Section */}
                  {showCorrectAnswers && (
                    <ExplanationSection
                      title="Show Translation"
                      expanded={isTranslationExpanded}
                      onToggle={() => toggleTranslation(groupIndex)}
                      explanation={group.groupContext?.translation || ''}
                    />
                  )}
                </div>

                {/* Questions */}
                <div className="lg:col-span-2 space-y-4">
                  {group.questions?.map((question) => {
                    const userAnswer = getUserAnswer(
                      showCorrectAnswers,
                      getAnswer,
                      question.questionNumber,
                      mockAnswers
                    );
                    const isExplanationExpanded = isExpanded(
                      question.questionNumber
                    );
                    return (
                      <Card
                        key={question.questionNumber}
                        id={`question-${question.questionNumber}`}
                      >
                        <CardContent className="p-6">
                          <QuestionHeader
                            questionNumber={question.questionNumber}
                          />
                          <p className="mb-4 font-medium">
                            {question.questionText}
                          </p>
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
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
