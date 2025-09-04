// pages/RecordingPage.tsx
import OverallHeader from '@/features/testss/components/OverallHeader';
import SpeechScoreSidebar from '@/features/testss/components/SpeechScoreSidebar';
import RecordingDetailContent from '@/features/testss/components/RecordingDetailContent';

const RecordingPage = () => {
  return (
    <section className="bg-gray-100 min-h-screen">
      <OverallHeader />

      <div className="p-4 md:p-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
          {/* 2 cột */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Trái: Sidebar cố định 20rem, không co */}
            <aside className="lg:w-80 lg:flex-none">
              <SpeechScoreSidebar />
            </aside>

            {/* Phải: chiếm hết phần còn lại */}
            <main className="flex-1 min-w-0">
              <RecordingDetailContent />
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecordingPage;
