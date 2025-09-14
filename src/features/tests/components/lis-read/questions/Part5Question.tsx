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

interface Part5QuestionProps {
  part: TestPart;
}

export const Part5Question = ({ part }: Part5QuestionProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );

  // Mock user answers for demonstration
  const getMockUserAnswer = (questionNumber: number) => {
    const mockAnswers: { [key: number]: string } = {
      101: 'B', // correct
      102: 'D', // correct
      103: 'C', // correct
      104: 'A', // incorrect - correct is B
      105: 'B', // correct
      106: 'C',
      107: 'A',
      108: 'D',
      109: 'B',
      110: 'C',
      111: 'A',
      112: 'D',
      113: 'B',
      114: 'C',
      115: 'A',
      116: 'D',
      117: 'B',
      118: 'C',
      119: 'A',
      120: 'D',
      121: 'B',
      122: 'C',
      123: 'A',
      124: 'D',
      125: 'B',
      126: 'C',
      127: 'A',
      128: 'D',
      129: 'B',
      130: 'C',
    };
    return mockAnswers[questionNumber] || 'A';
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
          const mockUserAnswer = getMockUserAnswer(question.questionNumber);
          const isCorrect = mockUserAnswer === question.correctAnswer;
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
                    {question.options.map((option) => (
                      <div
                        key={option.label}
                        className={`p-4 rounded-lg border-2 transition-colors cursor-pointer hover:shadow-md ${
                          option.label === question.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-950'
                            : option.label === mockUserAnswer &&
                                mockUserAnswer !== question.correctAnswer
                              ? 'border-red-500 bg-red-50 dark:bg-red-950'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              option.label === question.correctAnswer
                                ? 'border-green-500 bg-green-500 text-white'
                                : option.label === mockUserAnswer &&
                                    mockUserAnswer !== question.correctAnswer
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : 'border-gray-400 text-gray-600'
                            }`}
                          >
                            {option.label}
                          </div>
                          <span className="text-sm flex-1">{option.text}</span>
                          {option.label === question.correctAnswer && (
                            <Badge
                              variant="secondary"
                              className="bg-green-500 text-white"
                            >
                              Correct
                            </Badge>
                          )}
                          {option.label === mockUserAnswer &&
                            mockUserAnswer !== question.correctAnswer && (
                              <Badge variant="destructive">Your choice</Badge>
                            )}
                        </div>
                      </div>
                    ))}
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
