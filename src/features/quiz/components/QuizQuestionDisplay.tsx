import { CardContent } from '@/components/ui/card';
import { MediaPlayer } from './MediaPlayer';
import type { QuizQuestion } from '../slices/quizSlice';

interface QuizQuestionDisplayProps {
  currentQ: QuizQuestion;
  isReviewMode?: boolean;
}

export const QuizQuestionDisplay = ({
  currentQ,
  isReviewMode = false,
}: QuizQuestionDisplayProps) => {
  return (
    <CardContent className="space-y-6">
      {/* Question */}
      <div className="space-y-4">
        {currentQ.question.text && (
          <h3 className="text-lg font-medium">{currentQ.question.text}</h3>
        )}

        {currentQ.question.audio && (
          <MediaPlayer
            audio={currentQ.question.audio}
            audioId={`question-${currentQ.id}`}
          />
        )}

        {currentQ.question.image && (
          <div className="flex justify-center">
            <img
              src={currentQ.question.image}
              alt="Question visual"
              className="max-w-full h-auto rounded-lg border shadow-sm"
            />
          </div>
        )}

        {currentQ.question.imageGroup && (
          <div className="grid grid-cols-2 gap-4">
            {currentQ.question.imageGroup.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Question image ${idx + 1}`}
                className="w-full h-auto rounded-lg border shadow-sm"
              />
            ))}
          </div>
        )}

        {isReviewMode && currentQ.explanation && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <h5 className="font-semibold mb-1">Explanation:</h5>
            <p>{currentQ.explanation.text}</p>
          </div>
        )}
      </div>
    </CardContent>
  );
};
