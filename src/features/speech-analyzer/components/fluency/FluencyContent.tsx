import React from 'react';
import ScoreSummary from '../pronunciation/ScoreSummary';
import PaceScoreChart from './PaceScoreChart';
import PausingScoreChart from './PausingScoreChart';
import HesitationsIndicator from './HesitationsIndicator';
import PaceOverTimeChart from './PaceOverTimeChart';
import PausesAnalysisChart from './PausesAnalysisChart';
import SkillTips from './SkillTips';
import type { Recording } from '../../../recordings/types/recordings.types';
import type {
  RecordingAnalysis,
  RecordingOverallScores,
} from '../../types/pronunciation.types';

interface FluencyContentProps {
  recording?: Recording;
}

const FluencyContent: React.FC<FluencyContentProps> = ({ recording }) => {
  const analysis = recording?.analysis as RecordingAnalysis | undefined;
  const overall: RecordingOverallScores | undefined = analysis?.overall;

  // Calculate fluency level based on score
  const getFluencyLevel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const fluencyScore = overall?.FluencyScore || 0;
  const fluencyLevel = getFluencyLevel(fluencyScore);

  // Extract data from API response or use mock data
  interface FluencyData {
    points?: Array<{ time: number; value: number }>;
    feedbacks?: Array<{
      start_time: number;
      duration: number;
      correctness: string;
    }>;
    words_per_minute?: number;
    pausing_score?: number;
    hesitations_status?: string;
  }
  const analysisFluency = (recording?.analysis as RecordingAnalysis)?.analyses
    ?.fluency as FluencyData | undefined;
  const pacePoints =
    analysisFluency?.points?.map((p) => ({ time: p.time, value: p.value })) ||
    [];

  const pauseEvents =
    analysisFluency?.feedbacks?.map(
      (feedback: {
        start_time: number;
        duration: number;
        correctness: string;
      }) => ({
        time: feedback.start_time,
        duration: feedback.duration,
        type:
          feedback.correctness === 'warning'
            ? ('bad' as const)
            : ('good' as const),
      })
    ) || [];

  const paceScore = Number(analysisFluency?.words_per_minute ?? 0);
  const pausingScore = Number(analysisFluency?.pausing_score ?? 0);
  const hesitationsStatus = analysisFluency?.hesitations_status ?? '';

  const times = [...pacePoints, ...pauseEvents].map((p) => p.time);
  const totalDuration = times.length ? Math.max(...times) + 1 : 0;

  return (
    <div className="space-y-6">
      {/* Score Summary Section */}
      <ScoreSummary
        percentage={Math.round(fluencyScore)}
        level={fluencyLevel}
        title="Fluency Score"
        description={`Your fluency level is ${fluencyLevel}. Work on your speech pace and flow to improve!`}
      />

      {/* Fluency Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PaceScoreChart score={paceScore} />
        <PausingScoreChart score={pausingScore} />
        <HesitationsIndicator status={hesitationsStatus} />
      </div>

      {/* Advanced Charts Section */}
      <div className="space-y-6">
        <PaceOverTimeChart apiData={{ points: pacePoints, totalDuration }} />
        <PausesAnalysisChart apiData={{ pauses: pauseEvents, totalDuration }} />
      </div>

      {/* Tips for Improvements Section */}
      <SkillTips
        title="Tips for improvements"
        description={`Your fluency level is ${fluencyLevel}. Work on your speech pace and flow to improve!`}
        tips={[
          'Take time to pause at the end of complete sentences or after key ideas.',
          'Make sure your speech consistently flowing phrases. Timing during fluent speech will naturally slow down at the next punctuation mark or logical stop.',
          'Never interrupt the flow! Use the language you know to describe a missing concept or idea',
        ]}
        videoUrl={'https://www.youtube.com/watch?v=-oQXdfyA9JI'}
      />
    </div>
  );
};

export default FluencyContent;
