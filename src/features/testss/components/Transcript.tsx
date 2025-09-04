// components/Transcript.tsx
import EnhancedTranscript from './EnhancedTranscript';
import { createMockTranscriptData } from '../data/mockPronunciationData';

const Transcript = () => {
  const transcriptData = createMockTranscriptData();

  return (
    <div className="mt-8">
      <EnhancedTranscript 
        transcriptData={transcriptData}
        features={{
          showSegmentPlayButtons: true,
          enableWordClickToSeek: true,
          showAccuracyColors: true,
          showDetailedPopups: true,
          highlightCurrentSegment: true,
          autoScrollToCurrentSegment: true,
        }}
      />
    </div>
  );
};

export default Transcript;
