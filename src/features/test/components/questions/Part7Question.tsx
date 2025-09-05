import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Part7QuestionProps {
  part: {
    partName: string;
    partId: string;
    questionGroups: Array<{
      groupContext: {
        audioUrl: null;
        imageUrls: string[] | null;
        passageHtml: string;
        transcript: string;
        translation?: string;
      };
      questions: Array<{
        questionNumber: number;
        questionText: string;
        options: Array<{ label: string; text: string }>;
        correctAnswer: string;
        userAnswer?: string;
        explanation: string;
      }>;
    }>;
  };
}

export const Part7Question = ({ part }: Part7QuestionProps) => {
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );
  const [expandedTranscripts, setExpandedTranscripts] = useState<number[]>([]);
  const [expandedTranslations, setExpandedTranslations] = useState<number[]>(
    []
  );

  // Mock user answers for demonstration
  const getMockUserAnswer = (questionNumber: number) => {
    const mockAnswers: { [key: number]: string } = {
      // Single passage questions (147-200)
      147: 'C', // correct
      148: 'B', // correct
      149: 'B', // correct
      150: 'C', // correct
      151: 'B', // correct
      152: 'D', // correct
      153: 'A', // correct
      154: 'B', // correct
      155: 'A', // correct
      156: 'D', // correct
      157: 'B', // correct
      158: 'B', // correct
      159: 'A', // correct
      160: 'B', // correct
      161: 'C', // incorrect - should be A
      162: 'B', // correct
      163: 'D', // incorrect - should be C
      164: 'A', // correct
      165: 'B', // correct
      // Multiple passage questions would continue...
      196: 'A', // correct
      197: 'C', // correct
      198: 'C', // correct
      199: 'D', // correct
      200: 'B', // correct
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
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {part.partName}
        </Badge>
        <span className="text-muted-foreground">
          Questions {part.questionGroups[0]?.questions[0]?.questionNumber} -{' '}
          {
            part.questionGroups[part.questionGroups.length - 1]?.questions[
              part.questionGroups[part.questionGroups.length - 1]?.questions
                .length - 1
            ]?.questionNumber
          }
        </span>
      </div>

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
        {part.questionGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="border rounded-lg p-6 bg-background">
            {/* Group Header */}
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Questions {group.questions[0]?.questionNumber} -{' '}
                {group.questions[group.questions.length - 1]?.questionNumber}
              </Badge>

              <span className="text-sm text-muted-foreground">
                {group.questions.length === 1
                  ? 'Single passage'
                  : group.questions.length <= 4
                    ? 'Single passage (multiple questions)'
                    : 'Multiple passages'}
              </span>
            </div>

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

                {/* Reading Passage - only show if no images */}
                {(!group.groupContext.imageUrls ||
                  group.groupContext.imageUrls.length === 0) && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium mb-4">
                        Reading Passage
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: group.groupContext.passageHtml,
                        }}
                        className="prose prose-sm max-w-none dark:prose-invert leading-relaxed"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Translation Section */}
                {group.groupContext.translation && (
                  <Collapsible
                    open={expandedTranslations.includes(groupIndex)}
                    onOpenChange={() => toggleTranslation(groupIndex)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        Show Translation
                        {expandedTranslations.includes(groupIndex) ? (
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
                              __html: group.groupContext.translation,
                            }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          />
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Vietnamese Translation fallback */}
                {!group.groupContext.translation &&
                  group.groupContext.transcript && (
                    <Collapsible
                      open={expandedTranslations.includes(groupIndex)}
                      onOpenChange={() => toggleTranslation(groupIndex)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Show Translation
                          {expandedTranslations.includes(groupIndex) ? (
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
                                __html: group.groupContext.transcript,
                              }}
                              className="prose prose-sm max-w-none dark:prose-invert"
                            />
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
              </div>

              {/* Questions and Options */}
              <div className="space-y-6">
                {group.questions.map((question) => {
                  const mockUserAnswer = getMockUserAnswer(
                    question.questionNumber
                  );
                  const isCorrect = mockUserAnswer === question.correctAnswer;
                  const isExplanationExpanded = expandedExplanations.includes(
                    question.questionNumber
                  );

                  return (
                    <div
                      key={question.questionNumber}
                      id={`question-${question.questionNumber}`}
                      className="border rounded-lg p-4 bg-card"
                    >
                      {/* Question Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-lg font-semibold mb-2">
                          Question {question.questionNumber}
                        </h3>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4">
                        <p className="text-base font-medium">
                          {question.questionText}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => (
                          <div
                            key={option.label}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              option.label === question.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : option.label === mockUserAnswer &&
                                    mockUserAnswer !== question.correctAnswer
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                  : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                  option.label === question.correctAnswer
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : option.label === mockUserAnswer &&
                                        mockUserAnswer !==
                                          question.correctAnswer
                                      ? 'border-red-500 bg-red-500 text-white'
                                      : 'border-gray-400 text-gray-600'
                                }`}
                              >
                                {option.label}
                              </div>
                              <span className="text-sm flex-1">
                                {option.text}
                              </span>
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
                                  <Badge variant="destructive">
                                    Your choice
                                  </Badge>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
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
