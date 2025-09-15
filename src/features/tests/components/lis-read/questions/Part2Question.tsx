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
import { useTestSession } from '@/features/tests/hooks/useTestSession';

interface Part2QuestionProps {
  part: TestPart;
  showCorrectAnswers?: boolean;
}

export const Part2Question = ({
  part,
  showCorrectAnswers = false,
}: Part2QuestionProps) => {
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
            <strong>Instructions:</strong> You will hear a question or statement
            and three responses spoken in English. They will not be printed in
            your test book and will be spoken only one time. Select the best
            response to the question or statement and mark the letter (A), (B),
            or (C) on your answer sheet.
          </p>
        </CardContent>
      </Card>

      {/* All Questions */}
      <div className="space-y-8">
        {part.questions?.map((question) => {
          const userAnswer = getUserAnswer(question.questionNumber);
          const isCorrect = userAnswer === question.correctAnswer;
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
              <div className="flex items-center gap-4 mb-6">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Question {question.questionNumber}
                </Badge>
              </div>

              {/* Audio Player */}
              <div className="mb-6">
                <AudioPlayer audioUrl={question.media?.audioUrl || ''} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Explanation and Transcript */}
                <div className="space-y-4">
                  {/* Transcript Section */}
                  <Collapsible
                    open={isTranscriptExpanded}
                    onOpenChange={() =>
                      toggleTranscript(question.questionNumber)
                    }
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
                              __html: question.media?.transcript || '',
                            }}
                            className="prose prose-sm max-w-none dark:prose-invert"
                          />
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>

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

                  {/* Translation Section (if available) */}
                  {question.media?.translation && (
                    <Collapsible
                      open={isTranslationExpanded}
                      onOpenChange={() =>
                        toggleTranslation(question.questionNumber)
                      }
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
                                __html: question.media?.translation || '',
                              }}
                              className="prose prose-sm max-w-none dark:prose-invert"
                            />
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>

                {/* Right: Question and Options */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <div
                            key={option.label}
                            className={`p-4 rounded-lg border-2 transition-colors ${
                              showCorrectAnswers &&
                              option.label === question.correctAnswer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                : showCorrectAnswers &&
                                    option.label === userAnswer &&
                                    userAnswer !== question.correctAnswer
                                  ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                  : !showCorrectAnswers &&
                                      option.label === userAnswer
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 cursor-pointer'
                            }`}
                            onClick={() =>
                              handleAnswerSelect(
                                question.questionNumber,
                                option.label
                              )
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                                  showCorrectAnswers &&
                                  option.label === question.correctAnswer
                                    ? 'border-green-500 bg-green-500 text-white'
                                    : showCorrectAnswers &&
                                        option.label === userAnswer &&
                                        userAnswer !== question.correctAnswer
                                      ? 'border-red-500 bg-red-500 text-white'
                                      : !showCorrectAnswers &&
                                          option.label === userAnswer
                                        ? 'border-blue-500 bg-blue-500 text-white'
                                        : 'border-gray-400 hover:border-blue-500'
                                }`}
                              >
                                {option.label}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                (Listening options - no text displayed)
                              </span>
                              {showCorrectAnswers &&
                                option.label === question.correctAnswer && (
                                  <Badge
                                    variant="secondary"
                                    className="ml-auto bg-green-500 text-white"
                                  >
                                    Correct answer
                                  </Badge>
                                )}
                              {showCorrectAnswers &&
                                option.label === userAnswer &&
                                userAnswer !== question.correctAnswer && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto"
                                  >
                                    Your choice
                                  </Badge>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
