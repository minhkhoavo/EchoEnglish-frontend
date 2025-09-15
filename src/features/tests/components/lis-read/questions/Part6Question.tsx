import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
import { QuestionHeader } from '../common/QuestionHeader';
import { AnswerOptions } from '../common/AnswerOptions';
import { ExplanationSection } from '../common/ExplanationSection';

interface Part6QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part6Question = ({
  part,
  showCorrectAnswers = false,
}: Part6QuestionProps) => {
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
        131: 'D',
        132: 'D',
        133: 'A',
        134: 'B',
        135: 'C',
        136: 'A',
        137: 'B',
        138: 'C',
        139: 'D',
        140: 'A',
        141: 'B',
        142: 'C',
        143: 'D',
        144: 'A',
        145: 'B',
        146: 'C',
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

  const toggleTranscript = (groupIndex: number) => {
    setExpandedTranscripts((prev) =>
      prev.includes(groupIndex)
        ? prev.filter((num) => num !== groupIndex)
        : [...prev, groupIndex]
    );
  };

  const toggleTranslation = (groupIndex: number) => {
    setExpandedTranslations((prev) =>
      prev.includes(groupIndex)
        ? prev.filter((num) => num !== groupIndex)
        : [...prev, groupIndex]
    );
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
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> Read the texts that follow. A word,
            phrase, or sentence is missing in parts of each text. Four answer
            choices for each question are given below the text. Select the best
            answer to complete the text.
          </p>
        </CardContent>
      </Card>

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
                  (group.groupContext.translation ||
                    group.groupContext.transcript) && (
                    <ExplanationSection
                      expanded={expandedTranslations.includes(groupIndex)}
                      onToggle={() => toggleTranslation(groupIndex)}
                      explanation={
                        group.groupContext?.translation ||
                        group.groupContext?.transcript ||
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
                {group.questions.map((question) => {
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
