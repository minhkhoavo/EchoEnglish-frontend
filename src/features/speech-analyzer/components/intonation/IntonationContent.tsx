import { useMemo } from 'react';
import PitchVariationChart from './PitchVariationChart';
import Transcript from '../shared/Transcript';
import type {
  RecordingAnalysis,
  TranscriptData,
} from '../../types/pronunciation.types';
import type { Recording } from '../../../recordings/types/recordings.types';

export interface IntonationContentProps {
  recording?: Recording | null;
}

const IntonationContent = ({ recording }: IntonationContentProps) => {
  const analysis = (recording?.analysis as RecordingAnalysis) || undefined;

  const transcriptData = useMemo<TranscriptData | undefined>(() => {
    if (!recording) return undefined;
    if (analysis) return analysis; // RecordingAnalysis extends TranscriptData
    if (typeof recording.transcript === 'string') {
      try {
        return JSON.parse(recording.transcript) as TranscriptData;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }, [recording, analysis]);

  const prosodyScore = analysis?.overall?.ProsodyScore ?? 0;
  const level =
    prosodyScore >= 85
      ? 'Advanced'
      : prosodyScore >= 70
        ? 'Intermediate'
        : prosodyScore >= 50
          ? 'Elementary'
          : 'Beginner';

  // Sample pitch data - in real app this would come from analysis
  const pitchData = [
    { time: 0, frequency: 250 },
    { time: 5, frequency: 120 },
    { time: 10, frequency: 180 },
    { time: 15, frequency: 160 },
    { time: 20, frequency: 140 },
    { time: 25, frequency: 200 },
  ];

  // Transcript features for intonation - only show stress marking
  const intonationTranscriptFeatures = {
    enableWordClickToSeek: true,
    showAccuracyColors: false, // Don't show accuracy colors for intonation
    autoScrollToCurrentSegment: true,
  };

  return (
    <div className="flex-grow p-5 border-2 border-gray-200 rounded-xl min-w-0">
      <div className="w-full space-y-6">
        {/* Score Summary for Intonation */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Intonation Analysis
            </h2>
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {Math.round(prosodyScore)}%
            </div>
            <div className="text-lg font-medium text-gray-700 mb-1">
              {level}
            </div>
            <div className="text-sm text-gray-600">
              Your speech rhythm and pitch variation
            </div>
          </div>
        </div>

        {/* Pitch Variation Chart */}
        <PitchVariationChart
          data={pitchData}
          targetRange={{ min: 100, max: 200 }}
        />

        {/* Tips for Intonation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Tips for improvements
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎵</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Video tutorial 'Intonation'
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Make the following type of words more prominent by saying them
                  louder and with energy:
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Nouns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Main verbs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Adjectives</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span>Adverbs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript with stress marking only */}
        <Transcript
          transcriptData={transcriptData ?? undefined}
          mode="intonation"
          features={intonationTranscriptFeatures}
        />
      </div>
    </div>
  );
};

export default IntonationContent;
