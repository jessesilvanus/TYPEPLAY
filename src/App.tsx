/**
 * TYPEPLAY — App
 * ==========================================================================
 * Application root: sets up the client-side router and wraps every route in
 * the shared PageContainer shell (header + main + footer). Business logic
 * stays in feature modules, stores, hooks, and the typing engine.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PageContainer from './components/layout/PageContainer';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import LearnPage from './pages/LearnPage';
import LessonPage from './pages/LessonPage';
import ProgressPage from './pages/ProgressPage';
import TypingTestPage from './pages/TypingTestPage';
import MusicPage from './pages/MusicPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <PageContainer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:lessonId" element={<LessonPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/test" element={<TypingTestPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageContainer>
    </BrowserRouter>
  );
}
