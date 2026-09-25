import { Routes, Route } from 'react-router-dom';
import AssignedQueuePage from './pages/AssignedQueuePage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { RequireDepartmentAuth } from './components/RequireDepartmentAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RequireDepartmentAuth><AssignedQueuePage /></RequireDepartmentAuth>} />
      <Route path="/complaints/:id" element={<RequireDepartmentAuth><ComplaintDetailPage /></RequireDepartmentAuth>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}
