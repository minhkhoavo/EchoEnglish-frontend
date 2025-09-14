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

  // Mock user answers for demonstration - only show when viewing history
  const getMockUserAnswer = (questionNumber: number) => {
    if (!showCorrectAnswers) return null;

    const mockAnswers: { [key: number]: string } = {
      131: 'D', // correct
      132: 'D', // correct
      133: 'A', // correct
      134: 'B', // correct
      135: 'C', // correct
      136: 'A', // correct
      137: 'B', // correct
      138: 'B', // correct
      139: 'A', // incorrect - should be B
      140: 'C', // correct
      141: 'D', // correct
      142: 'A', // correct
      143: 'B', // incorrect - should be C
      144: 'C', // correct
      145: 'D', // correct
      146: 'A', // correct
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
          Questions {part.questionGroups?.[0]?.questions?.[0]?.questionNumber} -{' '}
          {
            part.questionGroups?.[part.questionGroups.length - 1]?.questions?.[
              part.questionGroups[part.questionGroups.length - 1]?.questions
                ?.length - 1
            ]?.questionNumber
          }
        </span>
      </div>

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
            <div className="flex items-center gap-4 mb-6">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Questions {group.questions[0]?.questionNumber} -{' '}
                {group.questions[group.questions.length - 1]?.questionNumber}
              </Badge>
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
                {(group.groupContext.translation ||
                  group.groupContext.transcript) && (
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
                              __html:
                                group.groupContext?.translation ||
                                group.groupContext?.transcript ||
                                '',
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
              <div
                className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6',
                }}
              >
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

                      {/* Options */}
                      <div className="space-y-2 mb-4">
                        {question.options.map((option) => (
                          <div
                            key={option.label}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              showCorrectAnswers &&
                              option.label === question.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : showCorrectAnswers &&
                                    option.label === mockUserAnswer &&
                                    mockUserAnswer !== question.correctAnswer
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                  showCorrectAnswers &&
                                  option.label === question.correctAnswer
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : showCorrectAnswers &&
                                        option.label === mockUserAnswer &&
                                        mockUserAnswer !==
                                          question.correctAnswer
                                      ? 'border-red-500 bg-red-500 text-white'
                                      : 'border-gray-400 text-gray-600 hover:border-blue-500'
                                }`}
                              >
                                {option.label}
                              </div>
                              <span className="text-sm flex-1">
                                {option.text}
                              </span>
                              {showCorrectAnswers &&
                                option.label === question.correctAnswer && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-500 text-white"
                                  >
                                    Correct
                                  </Badge>
                                )}
                              {showCorrectAnswers &&
                                option.label === mockUserAnswer &&
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
