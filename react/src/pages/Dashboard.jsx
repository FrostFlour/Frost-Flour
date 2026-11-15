import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import ProfilePage from './client/ProfilePage.jsx';

function BlankDashboard() {
  return <main aria-label="Dashboard" />;
}

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<BlankDashboard />} />
      <Route path="/profile" element={<MainLayout />}>
        <Route index element={<ProfilePage />} />
      </Route>
      <Route path="/login" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
