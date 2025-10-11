import React from 'react';
import { Eye, Lightbulb, FileText } from 'lucide-react';

interface Component {
  code: string;
  name: string;
  outline: string;
  sample: string;
}

interface Suggestion {
  code: string;
  name: string;
  components: Component[];
}

interface IdeasDisplayProps {
  idea: string;
  show: boolean;
}

export const IdeasDisplay: React.FC<IdeasDisplayProps> = ({ idea, show }) => {
  if (!show) return null;

  return (
    <div className="p-4 bg-yellow-50 rounded-lg border">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        Ideas & Tips:
      </h4>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: idea }}
      />
    </div>
  );
};

interface SampleAnswerDisplayProps {
  sampleAnswer: string;
  show: boolean;
  isEmail?: boolean;
  isEssay?: boolean;
  suggestions?: Suggestion[];
}

export const SampleAnswerDisplay: React.FC<SampleAnswerDisplayProps> = ({
  sampleAnswer,
  show,
  isEmail = false,
  isEssay = false,
  suggestions,
}) => {
  if (!show) return null;

  return (
    <div className="p-6 bg-green-50 rounded-xl border border-green-200 shadow-sm mt-4">
      <h4 className="font-bold mb-3 flex items-center gap-2 text-green-700">
        <Eye className="h-5 w-5" />
        Sample Answer
      </h4>
      {isEmail ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div
            className="email-sample-content text-green-900"
            dangerouslySetInnerHTML={{ __html: sampleAnswer }}
          />
        </div>
      ) : isEssay ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div
            className="essay-sample-content text-green-900 prose prose-base max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sampleAnswer }}
          />
        </div>
      ) : (
        <div
          className="prose prose-base max-w-none text-green-900"
          dangerouslySetInnerHTML={{ __html: sampleAnswer }}
        />
      )}
    </div>
  );
};

interface SuggestionsDisplayProps {
  suggestions: Suggestion[];
  show: boolean;
}

interface AnswerDisplayProps {
  currentPhase: 'idle' | 'preparation' | 'response' | 'completed';
  recordedBlob: Blob | null;
  onRecordAgain?: () => void;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  currentPhase,
  recordedBlob,
  onRecordAgain,
}) => {
  if (currentPhase !== 'completed') return null;

  if (!recordedBlob) {
    return (
      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-orange-800 mb-1">No Recording</h4>
            <p className="text-sm text-orange-600">
              Time's up! You didn't record an answer.
            </p>
          </div>
          {onRecordAgain && (
            <button
              onClick={onRecordAgain}
              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return null; // RecordingPlayback will handle showing the recorded audio
};

export const SuggestionsDisplay: React.FC<SuggestionsDisplayProps> = ({
  suggestions,
  show,
}) => {
  if (!show) return null;

  return (
    <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 shadow-sm mt-4">
      <h4 className="font-bold mb-4 flex items-center gap-2 text-blue-700">
        <FileText className="h-5 w-5" />
        Essay Structure Guide
      </h4>
      <div className="space-y-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.code}
            className="bg-white rounded-lg p-4 border border-blue-100"
          >
            <h5 className="font-semibold text-blue-800 mb-3 text-lg">
              {suggestion.name}
            </h5>
            <div className="space-y-4">
              {suggestion.components.map((component: Component) => (
                <div
                  key={component.code}
                  className="border-l-4 border-blue-300 pl-4"
                >
                  <h6 className="font-medium text-blue-700 mb-2">
                    {component.name}
                  </h6>
                  <div className="mb-3">
                    <div className="text-sm text-blue-600 mb-2 font-medium">
                      Outline:
                    </div>
                    <div
                      className="text-sm text-blue-800 bg-blue-50 p-2 rounded"
                      dangerouslySetInnerHTML={{
                        __html: component.outline,
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-green-600 mb-2 font-medium">
                      Sample:
                    </div>
                    <div
                      className="text-sm text-green-800 bg-green-50 p-3 rounded border-l-2 border-green-300"
                      dangerouslySetInnerHTML={{
                        __html: component.sample,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
