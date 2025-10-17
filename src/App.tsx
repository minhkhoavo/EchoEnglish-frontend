import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useLocation } from 'react-router-dom';

// Layout
import { Layout } from './components/layout/Layout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Main Application Pages

// Dashboard Pages
import ContentPage from './pages/ContentPage';
import { UserDashboardPage } from './features/user-dashboard/pages/UserDashboardPage';
import ProfilePage from './pages/auth/ProfilePage';

// Learning Features
import FlashcardPage from './pages/FlashcardPage';
import AllTestsPage from './pages/test/AllTestsPage';
import { QuizInterface } from './features/quiz/QuizInterface';
import RecordingsPage from './pages/RecordingsPage';

// Test Taking & Exams
import MicrophoneCheck from './pages/test/MicrophoneCheck';
import SpeakingExam from './pages/test/SpeakingExam';
import WritingExam from './pages/test/WritingExam';
import WritingModeSelection from './pages/test/WritingModeSelection';
import TestExam from './pages/test/TestExam';

// Test Results & Analysis
import ExamAttemptsPage from './pages/ExamAttemptsPage';
import { ExamAnalysisPage } from './pages/ExamAnalysisPage';
import SpeechAnalyzePage from './pages/SpeechAnalyzePage';
import SpeakingResultDemoPage from './pages/SpeakingResultDemoPage';
import SpeakingResultPage from './pages/SpeakingResultPage';
import WritingResultPage from './pages/WritingResultPage';

// Learning & Practice
import { PersonalizedLearningSetup } from './features/learning-plan-setup';
import PracticeDrillPage from './pages/PracticeDrillPage';

// Payment
import PaymentPage from './features/payment/pages/PaymentPage';
import { PaymentHistoryPage } from './pages/PaymentHistoryPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';

// Admin Routes
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import AdminNotificationPage from './pages/admin/AdminNotificationPage';
import AdminResourcePage from './pages/admin/AdminResourcePage';

// Resources
import ResourcePage from './pages/resource/ResourcePage';
import ResourceDetailPage from './pages/resource/ResourceDetailPage';

// Test Management
import { ToeicTestDetail } from './features/tests/components/lis-read/TOEICTestDetail';

// Error Pages
import NotFound from './pages/NotFound';

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* ================================================================== */}
        {/* MAIN APP ROUTES - With Layout (Header + Sidebar) */}
        {/* ================================================================== */}
        <Route element={<Layout />}>
          {/* DASHBOARD & PROFILE */}
          <Route path="/" element={<ContentPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />

          {/* LEARNING FEATURES */}
          <Route path="/flashcards" element={<FlashcardPage />} />
          <Route path="/quiz" element={<QuizRouteWrapper />} />
          <Route path="/tests" element={<AllTestsPage />} />
          <Route path="/recordings" element={<RecordingsPage />} />

          {/* TEST TAKING & EXAMS */}
          <Route
            path="/test/speaking/:testId/check"
            element={<MicrophoneCheck />}
          />
          <Route
            path="/test/speaking/:testId/exam"
            element={<SpeakingExam />}
          />
          <Route
            path="/test/writing/:testId/select"
            element={<WritingModeSelection />}
          />
          <Route path="/test/writing/:testId/exam" element={<WritingExam />} />
          <Route path="/speaking-exam/:testId" element={<MicrophoneCheck />} />

          {/* TEST RESULTS & ANALYSIS */}
          <Route path="/me/tests" element={<ExamAttemptsPage />} />
          <Route
            path="/me/tests/:attemptId/analysis"
            element={<ExamAnalysisPage />}
          />
          <Route
            path="/speech/recordings/:id"
            element={<SpeechAnalyzePage />}
          />
          <Route path="/test-detail/:testId" element={<ToeicTestDetail />} />
          <Route path="/test-exam/:testId" element={<TestExam />} />
          <Route path="/test-exam" element={<TestExam />} />
          <Route
            path="/speaking-result-demo"
            element={<SpeakingResultDemoPage />}
          />
          <Route path="/speaking-result" element={<SpeakingResultPage />} />
          <Route path="/writing-result" element={<WritingResultPage />} />

          {/* LEARNING & PRACTICE */}
          <Route
            path="/learning-plan/setup"
            element={<PersonalizedLearningSetup />}
          />
          <Route path="/practice-drill" element={<PracticeDrillPage />} />

          {/* PAYMENT & CREDITS */}
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/history" element={<PaymentHistoryPage />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route
            path="/admin/notification"
            element={<AdminNotificationPage />}
          />
          <Route path="/admin/resources" element={<AdminResourcePage />} />

          {/* RESOURCES */}
          <Route path="/resources" element={<ResourcePage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
        </Route>

        {/* ================================================================== */}
        {/* 404 NOT FOUND */}
        {/* ================================================================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
export default App;
