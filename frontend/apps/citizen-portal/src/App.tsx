import { Routes, Route } from 'react-router-dom';
import ReportIssuePage from './pages/ReportIssuePage';
import TrackComplaintsPage from './pages/TrackComplaintsPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ReportIssuePage />} />
      <Route path="/complaints" element={<TrackComplaintsPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
