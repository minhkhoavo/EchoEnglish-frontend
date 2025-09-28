import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentPage from './pages/ContentPage';
import FlashcardPage from './pages/FlashcardPage';
import AllTestsPage from './pages/test/AllTestsPage';
import SpeakingExam from './pages/test/SpeakingExam';
import WritingExam from './pages/test/WritingExam';
import MicrophoneCheck from './pages/test/MicrophoneCheck';
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
import TestExam from './pages/test/TestExam';
import SpeechAnalyzePage from './pages/SpeechAnalyzePage';
import SpeakingResultDemoPage from './pages/SpeakingResultDemoPage';
import SpeakingResultPage from './pages/SpeakingResultPage';
import ExamAttemptsPage from './pages/ExamAttemptsPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import PaymentPage from './features/payment/pages/PaymentPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import NotFound from './pages/NotFound';
import AdminNotificationPage from './pages/admin/AdminNotificationPage';

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
        <Route path="/" element={<ContentPage />} />
        <Route path="/me/tests" element={<ExamAttemptsPage />} />

        {/* Payment Routes */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/history" element={<PaymentHistoryPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />

        <Route
          path="/speaking-result-demo"
          element={<SpeakingResultDemoPage />}
        />
        <Route path="/speech/recordings/:id" element={<SpeechAnalyzePage />} />
        <Route path="/recordings" element={<RecordingsPage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/quiz" element={<QuizRouteWrapper />} />
        <Route path="/tests" element={<AllTestsPage />} />
        <Route path="/speaking-exam/:testId" element={<MicrophoneCheck />} />
        <Route
          path="/test/speaking/:testId/check"
          element={<MicrophoneCheck />}
        />
        <Route path="/test/speaking/:testId/exam" element={<SpeakingExam />} />
        <Route path="/writing-exam/:testId" element={<WritingExam />} />
        <Route path="/test-exam/:testId" element={<TestExam />} />
        {/* Support review mode without testId in path */}
        <Route path="/test-exam" element={<TestExam />} />
        <Route path="/speaking-result" element={<SpeakingResultPage />} />

        <Route path="/ad-notification" element={<AdminNotificationPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
