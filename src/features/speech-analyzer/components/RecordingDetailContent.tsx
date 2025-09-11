import { useMemo } from 'react';
import ScoreSummary from './ScoreSummary';
import TopErrors from './TopErrors.tsx';
import SkillsSection from './SkillsSection.tsx';
import Transcript from './Transcript.tsx';
import type {
  RecordingAnalysis,
  TranscriptData,
} from '../types/pronunciation.types';
import type { Recording } from '../../recordings/types/recordings.types';

export interface RecordingDetailContentProps {
  recording?: Recording | null;
}

const RecordingDetailContent = ({ recording }: RecordingDetailContentProps) => {
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

  const pronScore = analysis?.overall?.PronScore ?? 0;
  const level =
    pronScore >= 85
      ? 'Advanced'
      : pronScore >= 70
        ? 'Intermediate'
        : pronScore >= 50
          ? 'Elementary'
          : 'Beginner';

  const chartData = analysis?.analyses?.pronunciation?.chartData ?? [];
  const topMistakes = analysis?.analyses?.pronunciation?.topMistakes ?? [];

  return (
    <div className="flex-grow p-5 border-2 border-gray-200 rounded-xl min-w-0">
      <div className="w-full">
        <ScoreSummary percentage={Math.round(pronScore)} level={level} />
        <TopErrors chartData={chartData} topMistakes={topMistakes} />
        <SkillsSection topMistakes={topMistakes} />
        <Transcript transcriptData={transcriptData ?? undefined} />
      </div>
    </div>
  );
};

export default RecordingDetailContent;
