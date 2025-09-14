import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { SpeakingQuestion } from './SpeakingQuestion';
import type { SpeakingPartProps } from '@/features/tests/types/speaking-test.types';

export const SpeakingPart: React.FC<SpeakingPartProps> = ({
  part,
  onAnswer,
  userAnswers = {},
  isReviewMode = false,
  baseQuestionNumber = 0, // New prop for calculating absolute question numbers
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{part.title}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              Part {part.offset}
            </Badge>
          </div>
        </div>

        {/* Part Direction */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Instructions:</h4>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: part.direction.text }}
          />
        </div>

        {/* Narrator section if available */}
        {part.narrator && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Scenario:</h4>
            <p className="text-sm">{part.narrator.text}</p>
            {part.narrator.audio && (
              <AudioPlayer audioUrl={part.narrator.audio} className="mt-2" />
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {part.questions.map((question, index) => (
            <SpeakingQuestion
              key={question.id}
              question={question}
              partTitle={part.title}
              questionIndex={index}
              totalQuestions={part.questions.length}
              absoluteQuestionNumber={baseQuestionNumber + index + 1}
              onAnswer={onAnswer}
              userAnswer={userAnswers[question.id]}
              isReviewMode={isReviewMode}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
