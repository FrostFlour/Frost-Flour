import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import ProfilePage from './client/ProfilePage.jsx';
import ChangePasswordPage from './client/ChangePasswordPage.jsx';
import AgentLayout from '../layouts/AgentLayout.jsx';
import CreateAgentPage from './agent/CreateAgentPage.jsx';
import CategoryFormPage from './agent/CategoryFormPage.jsx';
import ProductFormPage from './agent/ProductFormPage.jsx';

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
      {/* Agent space: every page below is shown inside AgentLayout (<Outlet />) */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<Navigate to="products/new" replace />} />
        <Route path="agents/new" element={<CreateAgentPage />} /> {/* US-08 */}
        <Route path="categories/new" element={<CategoryFormPage />} /> {/* US-11 */}
        <Route path="products/new" element={<ProductFormPage />} /> {/* US-14 */}
      </Route>
      <Route path="/login" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
