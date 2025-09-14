import OverallHeader from '@/features/speech-analyzer/components/shared/OverallHeader';
import SpeechScoreSidebar from '@/features/speech-analyzer/components/shared/SpeechScoreSidebar';
import PronunciationContent from '@/features/speech-analyzer/components/pronunciation/PronunciationContent';
import IntonationContent from '@/features/speech-analyzer/components/intonation/IntonationContent';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useGetRecordingByIdQuery } from '@/features/recordings/services/recordingsApi';
import type { Recording } from '@/features/recordings/types/recordings.types';
import type {
  RecordingAnalysis,
  RecordingOverallScores,
} from '@/features/speech-analyzer/types/pronunciation.types';
import { skipToken } from '@reduxjs/toolkit/query/react';
import FluencyContent from '@/features/speech-analyzer/components/fluency/FluencyContent';
import VocabularyPage from '@/features/speech-analyzer/pages/VocabularyPage';

const SpeechAnalyzePage = () => {
  const { id, view } = useParams<{ id: string; view?: string }>();
  const [currentView, setCurrentView] = useState(view || 'pronunciation');
  const { data: recording } = useGetRecordingByIdQuery(id ?? skipToken);
  const overall: RecordingOverallScores | undefined = (
    recording?.analysis as RecordingAnalysis | undefined
  )?.overall;
  // Update currentView when URL params change
  useEffect(() => {
    setCurrentView(view || 'pronunciation');
  }, [view]);

  const renderContent = () => {
    switch (currentView) {
      case 'intonation':
        return <IntonationContent recording={recording} />;
      case 'fluency':
        return <FluencyContent recording={recording} />;
      case 'grammar':
        // TODO: Create GrammarContent component
        return (
          <div className="p-6 text-center text-gray-500">
            Grammar analysis coming soon...
          </div>
        );
      case 'vocabulary':
        // TODO: Create VocabularyContent component
        return <VocabularyPage></VocabularyPage>;
      case 'pronunciation':
      default:
        return <PronunciationContent recording={recording} />;
    }
  };

  return (
    <section className="bg-gray-100 min-h-screen">
      <OverallHeader />

      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-80 lg:flex-none">
              <SpeechScoreSidebar
                overall={overall}
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </aside>
            <main className="flex-1 min-w-0">{renderContent()}</main>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeechAnalyzePage;
