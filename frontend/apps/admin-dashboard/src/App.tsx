import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import UserManagementPage from './pages/UserManagementPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import LoginPage from './pages/LoginPage';
import { RequireAdminAuth } from './components/RequireAdminAuth';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RequireAdminAuth><OverviewPage /></RequireAdminAuth>} />
      <Route path="/users" element={<RequireAdminAuth><UserManagementPage /></RequireAdminAuth>} />
      <Route path="/departments" element={<RequireAdminAuth><DepartmentManagementPage /></RequireAdminAuth>} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
