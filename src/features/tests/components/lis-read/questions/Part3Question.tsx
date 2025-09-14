import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AudioPlayer } from '@/components/AudioPlayer';
import type { TestPart } from '@/features/tests/types/toeic-test.types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Part3QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part3Question = ({
  part,
  showCorrectAnswers = false,
}: Part3QuestionProps) => {
  const [expandedTranscripts, setExpandedTranscripts] = useState<number[]>([]);
  const [expandedTranslations, setExpandedTranslations] = useState<number[]>(
    []
  );
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>(
    []
  );

  // Mock user answers for demonstration - only show when viewing history
  const getMockUserAnswer = (questionNumber: number) => {
    if (!showCorrectAnswers) return null;

    const mockAnswers: { [key: number]: string } = {
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
    return mockAnswers[questionNumber] || 'A';
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

  const toggleExplanation = (questionNumber: number) => {
    setExpandedExplanations((prev) =>
      prev.includes(questionNumber)
        ? prev.filter((num) => num !== questionNumber)
        : [...prev, questionNumber]
    );
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
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-lg px-4 py-2">
          {part.partName}
        </Badge>
        <span className="text-muted-foreground">
          Questions {allQuestions[0]?.questionNumber} -{' '}
          {allQuestions[allQuestions.length - 1]?.questionNumber}
        </span>
      </div>

      {/* Part Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Instructions:</strong> You will hear some conversations
            between two or more people. You will be asked to answer three
            questions about what the speakers say in each conversation. Select
            the best response to each question and mark the letter (A), (B),
            (C), or (D) on your answer sheet. The conversations will not be
            printed in your test book and will be spoken only one time.
          </p>
        </CardContent>
      </Card>

      {/* All Question Groups */}
      <div className="space-y-12">
        {part.questionGroups?.map((group, groupIndex) => {
          const isTranscriptExpanded = expandedTranscripts.includes(groupIndex);
          const isTranslationExpanded =
            expandedTranslations.includes(groupIndex);

          return (
            <div
              key={groupIndex}
              id={`group-${groupIndex}`}
              className="border-2 rounded-lg p-6 bg-background"
            >
              {/* Group Header */}
              <div className="flex items-center gap-4 mb-6">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Questions {group.questions[0].questionNumber} -{' '}
                  {group.questions[group.questions.length - 1].questionNumber}
                </Badge>
              </div>

              {/* Audio Player */}
              <div className="mb-6">
                <AudioPlayer audioUrl={group.groupContext?.audioUrl || ''} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Context Information */}
                <div className="space-y-4">
                  {/* Transcript Section */}
                  <Collapsible
                    open={isTranscriptExpanded}
                    onOpenChange={() => toggleTranscript(groupIndex)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        Transcript
                        {isTranscriptExpanded ? (
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
                              __html: group.groupContext?.transcript || '',
                            }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          />
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Translation Section */}
                  <Collapsible
                    open={isTranslationExpanded}
                    onOpenChange={() => toggleTranslation(groupIndex)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        Translation
                        {isTranslationExpanded ? (
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
                              __html: group.groupContext?.translation || '',
                            }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          />
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Questions */}
                <div className="lg:col-span-2 space-y-4">
                  {group.questions?.map((question) => {
                    const mockUserAnswer = getMockUserAnswer(
                      question.questionNumber
                    );
                    const isCorrect = mockUserAnswer === question.correctAnswer;
                    const isExplanationExpanded = expandedExplanations.includes(
                      question.questionNumber
                    );

                    return (
                      <Card
                        key={question.questionNumber}
                        id={`question-${question.questionNumber}`}
                      >
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">
                            Question {question.questionNumber}
                          </h3>
                          <p className="mb-4 font-medium">
                            {question.questionText}
                          </p>

                          <div className="space-y-3 mb-4">
                            {question.options.map((option) => (
                              <div
                                key={option.label}
                                className={`p-3 rounded-lg border-2 transition-colors ${
                                  showCorrectAnswers &&
                                  option.label === question.correctAnswer
                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                    : showCorrectAnswers &&
                                        option.label === mockUserAnswer &&
                                        mockUserAnswer !==
                                          question.correctAnswer
                                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-start gap-3">
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
                                          : 'border-gray-400 hover:border-blue-500'
                                    }`}
                                  >
                                    {option.label}
                                  </div>
                                  <span className="flex-1">{option.text}</span>
                                  {showCorrectAnswers &&
                                    option.label === question.correctAnswer && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-500 text-white"
                                      >
                                        Correct answer
                                      </Badge>
                                    )}
                                  {showCorrectAnswers &&
                                    option.label === mockUserAnswer &&
                                    mockUserAnswer !==
                                      question.correctAnswer && (
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
                                size="sm"
                                className="w-full justify-between"
                              >
                                Show explanation
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
