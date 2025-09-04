import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentPage from "./pages/ContentPage";
import RecordingPage from "./pages/RecordingPage";
import { Toaster } from "./components/ui/sonner";
import { QuizInterface } from "./features/quiz/QuizInterface";
import { useLocation } from 'react-router-dom';
import SpeechScoreSidebar from './features/testss/components/SpeechScoreSidebar';
import PronunciationDemo from './features/testss/components/PronunciationDemo';

const QuizRouteWrapper = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fileId = queryParams.get('fileId') || undefined;

  return <QuizInterface onClose={() => {}} fileId={fileId} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<ContentPage />} /> */}
        {/* <Route path="/" element={<RecordingPage />} /> */}
        <Route path="/" element={<PronunciationDemo />} />
        <Route path="/quiz" element={<QuizRouteWrapper />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
