import ScoreSummary from './ScoreSummary';
import TopErrors from './TopErrors.tsx';
import SkillsSection from './SkillsSection.tsx';
import Transcript from './Transcript.tsx';
import { createMockTranscriptData } from '../data/mockPronunciationData';

const RecordingDetailContent = () => {
  const transcriptData = createMockTranscriptData();

  return (
    <div className="flex-grow p-5 border-2 border-gray-200 rounded-xl min-w-0">
      <div className="w-full">
        <ScoreSummary />
        <TopErrors />
        <SkillsSection />
        <Transcript transcriptData={transcriptData} />
      </div>
    </div>
  );
};

export default RecordingDetailContent;
