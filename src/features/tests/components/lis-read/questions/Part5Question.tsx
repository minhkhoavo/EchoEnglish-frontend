import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useTestSession } from '@/features/tests/hooks/useTestSession';
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
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {part.partName}
        </Badge>
        <span className="text-muted-foreground">
          Questions {part.questions?.[0]?.questionNumber} -{' '}
          {part.questions?.[part.questions.length - 1]?.questionNumber}
        </span>
      </div>

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
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Question {question.questionNumber}
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Explanation and Summary - Left side */}
                <div className="space-y-4">
                  {/* Explanation Section */}
                  {showCorrectAnswers && (
                    <Collapsible
                      open={isExplanationExpanded}
                      onOpenChange={() =>
                        toggleExplanation(question.questionNumber)
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Show Explanation
                          {isExplanationExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <Card className="mt-2">
                          <CardContent className="p-4">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: question.explanation,
                              }}
                              className="prose prose-sm max-w-none dark:prose-invert"
                            />
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
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
                  <div className="space-y-3">
                    {question.options.map((option) => {
                      const userAnswer = getUserAnswer(question.questionNumber);
                      const isSelected = userAnswer === option.label;
                      const isCorrect = option.label === question.correctAnswer;

                      return (
                        <div
                          key={option.label}
                          onClick={() =>
                            handleAnswerSelect(
                              question.questionNumber,
                              option.label
                            )
                          }
                          className={`p-4 rounded-lg border-2 transition-colors cursor-pointer hover:shadow-md ${
                            showCorrectAnswers && isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-950'
                              : showCorrectAnswers && isSelected && !isCorrect
                                ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                : isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                showCorrectAnswers && isCorrect
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : showCorrectAnswers &&
                                      isSelected &&
                                      !isCorrect
                                    ? 'border-red-500 bg-red-500 text-white'
                                    : isSelected
                                      ? 'border-blue-500 bg-blue-500 text-white'
                                      : 'border-gray-400 text-gray-600 hover:border-blue-500'
                              }`}
                            >
                              {option.label}
                            </div>
                            <span className="text-sm flex-1">
                              {option.text}
                            </span>
                            {showCorrectAnswers && isCorrect && (
                              <Badge
                                variant="secondary"
                                className="bg-green-500 text-white"
                              >
                                Correct
                              </Badge>
                            )}
                            {showCorrectAnswers && isSelected && !isCorrect && (
                              <Badge variant="destructive">Your choice</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
