import { Routes, Route } from 'react-router-dom';
import AssignedQueuePage from './pages/AssignedQueuePage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AssignedQueuePage />} />
      <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
