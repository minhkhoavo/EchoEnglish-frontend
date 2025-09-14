import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/AudioPlayer';

interface QuestionHeaderProps {
  absoluteQuestionNumber?: number;
  questionIndex: number;
  title: string;
  audioUrl?: string;
  imageUrl?: string;
  isEmailQuestion?: boolean;
  directions?: string[];
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  absoluteQuestionNumber,
  questionIndex,
  title,
  audioUrl,
  imageUrl,
  isEmailQuestion = false,
  directions,
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="text-lg px-3 py-1">
          Question {absoluteQuestionNumber || questionIndex + 1}
        </Badge>
      </div>

      {/* Image Display */}
      {imageUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={imageUrl}
            alt="Question image"
            className="max-w-full h-auto rounded-lg border"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}

      {/* Title Display */}
      <div className="flex justify-center my-4">
        {isEmailQuestion ? (
          <div className="w-full max-w-2xl">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div
                  className="text-sm space-y-1 email-header"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              </div>
              {directions && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    Instructions:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {directions.map((direction, idx) => (
                      <li key={idx} className="list-disc list-inside">
                        {direction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <CardTitle className="text-lg">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </CardTitle>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && <AudioPlayer audioUrl={audioUrl} className="mb-4" />}

      <style>{`
        .email-header strong {
          color: #374151;
          font-weight: 600;
        }
        .email-header br {
          line-height: 1.6;
        }
      `}</style>
    </>
  );
};
