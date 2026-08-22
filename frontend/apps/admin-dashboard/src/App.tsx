import { Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import UserManagementPage from './pages/UserManagementPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/users" element={<UserManagementPage />} />
      <Route path="/departments" element={<DepartmentManagementPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
