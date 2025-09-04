import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ContentPage from './pages/ContentPage';
import { Toaster } from './components/ui/sonner';
import { QuizInterface } from './features/quiz/QuizInterface';
import { useLocation } from 'react-router-dom';

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
        <Route path="/" element={<ContentPage />} />
        <Route path="/quiz" element={<QuizRouteWrapper />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
