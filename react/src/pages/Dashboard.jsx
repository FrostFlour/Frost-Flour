import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import ProfilePage from './client/ProfilePage.jsx';
import ChangePasswordPage from './client/ChangePasswordPage.jsx';

function BlankDashboard() {
  return <main aria-label="Dashboard" />;
}

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<BlankDashboard />} />
      <Route path="/" element={<MainLayout />}>
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="/login" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
