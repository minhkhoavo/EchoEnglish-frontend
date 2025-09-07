import OverallHeader from '@/features/speech-analyzer/components/OverallHeader';
import SpeechScoreSidebar from '@/features/speech-analyzer/components/SpeechScoreSidebar';
import RecordingDetailContent from '@/features/speech-analyzer/components/RecordingDetailContent';

const SpeechAnalyzePage = () => {
  return (
    <section className="bg-gray-100 min-h-screen">
      <OverallHeader />

      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="lg:w-80 lg:flex-none">
              <SpeechScoreSidebar />
            </aside>
            <main className="flex-1 min-w-0">
              <RecordingDetailContent />
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpeechAnalyzePage;
