import { Routes, Route } from 'react-router-dom';
import ReportIssuePage from './pages/ReportIssuePage';
import TrackComplaintsPage from './pages/TrackComplaintsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import { RequireAuth } from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RequireAuth><ReportIssuePage /></RequireAuth>} />
      <Route path="/complaints" element={<RequireAuth><TrackComplaintsPage /></RequireAuth>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
    </Routes>
  );
}
