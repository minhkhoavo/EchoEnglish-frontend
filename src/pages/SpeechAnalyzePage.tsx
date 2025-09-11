import OverallHeader from '@/features/speech-analyzer/components/OverallHeader';
import SpeechScoreSidebar from '@/features/speech-analyzer/components/SpeechScoreSidebar';
import RecordingDetailContent from '@/features/speech-analyzer/components/RecordingDetailContent';
import { useParams } from 'react-router-dom';
import { useGetRecordingByIdQuery } from '@/features/recordings/services/recordingsApi';
import type { Recording } from '@/features/recordings/types/recordings.types';
import type {
  RecordingAnalysis,
  RecordingOverallScores,
} from '@/features/speech-analyzer/types/pronunciation.types';
import { skipToken } from '@reduxjs/toolkit/query/react';

const SpeechAnalyzePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: recording } = useGetRecordingByIdQuery(id ?? skipToken);
  const overall: RecordingOverallScores | undefined = (
    recording?.analysis as RecordingAnalysis | undefined
  )?.overall;
  return (
    <section className="bg-gray-100 min-h-screen">
      <OverallHeader />

      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-80 lg:flex-none">
              <SpeechScoreSidebar overall={overall} />
            </aside>
            <main className="flex-1 min-w-0">
              <RecordingDetailContent recording={recording} />
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeechAnalyzePage;
