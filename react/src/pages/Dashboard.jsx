import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import AgentLayout from '../layouts/AgentLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import ProfilePage from './client/ProfilePage.jsx';
import ChangePasswordPage from './client/ChangePasswordPage.jsx';
import ClientsPage from './agent/ClientsPage.jsx';

const AGENT_ROLES = ['Agent'];

function BlankDashboard() {
  return <main aria-label="Dashboard" />;
}

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<BlankDashboard />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={AGENT_ROLES} />}>
        <Route path="/agent" element={<AgentLayout />}>
          <Route path="clients" element={<ClientsPage />} />
        </Route>
      </Route>
      <Route path="/login" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
