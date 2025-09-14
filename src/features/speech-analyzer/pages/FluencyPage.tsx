import OverallHeader from '../components/shared/OverallHeader';
import SpeechScoreSidebar from '../components/shared/SpeechScoreSidebar';
import FluencyContent from '../components/fluency/FluencyContent';
import { useParams } from 'react-router-dom';
import { useGetRecordingByIdQuery } from '../../recordings/services/recordingsApi';
import type { Recording } from '../../recordings/types/recordings.types';
import type {
  RecordingAnalysis,
  RecordingOverallScores,
} from '../types/pronunciation.types';
import { skipToken } from '@reduxjs/toolkit/query/react';

const FluencyPage = () => {
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
              <SpeechScoreSidebar overall={overall} currentView="fluency" />
            </aside>
            <main className="flex-1 min-w-0">
              <FluencyContent recording={recording} />
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FluencyPage;
