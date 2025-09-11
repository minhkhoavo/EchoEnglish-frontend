import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentPage from './pages/ContentPage';
import FlashcardPage from './pages/FlashcardPage';
import TOEICTests from './pages/test/TOEICTests';
import TestExam from './pages/test/TestExam';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/auth/ProfilePage';
import RecordingsPage from './pages/RecordingsPage';
import { Toaster } from './components/ui/sonner';
import { QuizInterface } from './features/quiz/QuizInterface';
import { useLocation } from 'react-router-dom';
import SpeechAnalyzePage from './pages/SpeechAnalyzePage';

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
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Main App Routes */}
        {/* <Route path="/" element={<ContentPage />} /> */}
        <Route path="/" element={<ContentPage />} />
        <Route path="/speech/recordings/:id" element={<SpeechAnalyzePage />} />
        <Route path="/recordings" element={<RecordingsPage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/quiz" element={<QuizRouteWrapper />} />
        <Route path="/tests" element={<TOEICTests />} />
        <Route path="/test-exam/:testId" element={<TestExam />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
