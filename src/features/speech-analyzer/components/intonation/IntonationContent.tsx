import { useMemo, useEffect } from 'react';
import SkillTips from '../fluency/SkillTips';
import PitchVariationChart from './PitchVariationChart';
import Transcript from '../shared/Transcript';
import ScoreSummary from '../pronunciation/ScoreSummary';
import { useAppDispatch } from '@/core/store/store';
import { setIntonationMode } from '../../slices/speechAnalyzerSlice';
import type {
  RecordingAnalysis,
  TranscriptData,
} from '../../types/pronunciation.types';
import type { Recording } from '../../../recordings/types/recordings.types';

export interface IntonationContentProps {
  recording?: Recording | null;
}

const IntonationContent = ({ recording }: IntonationContentProps) => {
  const dispatch = useAppDispatch();
  const analysis = (recording?.analysis as RecordingAnalysis) || undefined;

  useEffect(() => {
    dispatch(setIntonationMode());
  }, [dispatch]);

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
  const defaultPitchData = [
    { time: 0, value: 250 },
    { time: 5, value: 120 },
    { time: 10, value: 180 },
    { time: 15, value: 160 },
    { time: 20, value: 140 },
    { time: 25, value: 200 },
  ];
  const raw = analysis?.analyses?.prosody?.pitch_points || defaultPitchData;
  const pitchData = raw.map((p) => ({
    time: p.time,
    frequency: p.value,
  }));

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
        <ScoreSummary
          percentage={Math.round(prosodyScore)}
          level={level}
          title="Intonation Score"
          description={`Your intonation level is ${level}. Work on your speech rhythm and pitch variation to improve!`}
        />

        {/* Pitch Variation Chart */}
        <PitchVariationChart
          data={pitchData}
          targetRange={{ min: 100, max: 200 }}
        />

        {/* Tips for Intonation */}
        <SkillTips
          title="Tips for improvements"
          description={
            "Video tutorial 'Intonation'\nMake the following type of words more prominent by saying them louder and with energy:"
          }
          tips={['Nouns', 'Main verbs', 'Adjectives', 'Adverbs']}
          videoUrl={'https://www.youtube.com/watch?v=zp0TGDymBb0'}
          videoTitle={'Video tutorial - Intonation'}
        />

        {/* Transcript with stress marking only */}
        <Transcript
          transcriptData={transcriptData ?? undefined}
          features={intonationTranscriptFeatures}
        />
      </div>
    </div>
  );
};

export default IntonationContent;
