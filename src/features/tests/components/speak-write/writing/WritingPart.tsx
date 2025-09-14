import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { WritingQuestion } from './WritingQuestion';
import type { WritingPartProps } from '@/features/tests/types/writing-test.types';

export const WritingPart: React.FC<WritingPartProps> = ({
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
            className="prose prose-sm max-w-none writing-directions"
            dangerouslySetInnerHTML={{ __html: part.direction.text }}
          />
          <style>{`
            .writing-directions ul { 
              margin-left: 1.5rem; 
              padding-left: 1.5rem;
              list-style-position: outside;
            }
            .writing-directions li {
              margin-bottom: 0.25rem;
              padding-left: 0.75rem;
              text-indent: 0;
            }
            .writing-directions ul[style*='list-style-type:disc'] {
              list-style-type: disc;
            }
          `}</style>
        </div>

        {/* Narrator section if available */}
        {part.narrator && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-semibold mb-2">Scenario:</h4>
            {part.narrator.text && (
              <p className="text-sm">{part.narrator.text}</p>
            )}
            {part.narrator.audio && (
              <AudioPlayer audioUrl={part.narrator.audio} className="mt-2" />
            )}
            {part.narrator.image && (
              <div className="mt-2">
                <img
                  src={part.narrator.image}
                  alt="Scenario image"
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {part.questions.map((question, index) => (
            <WritingQuestion
              key={question.id}
              question={question}
              part={part}
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
