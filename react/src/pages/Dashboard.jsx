import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import CatalogPage from './client/CatalogPage.jsx';
import CartPage from './client/CartPage.jsx';
import ProfilePage from './client/ProfilePage.jsx';
import ChangePasswordPage from './client/ChangePasswordPage.jsx';
import AgentLayout from '../layouts/AgentLayout.jsx';
import { getCurrentUser } from '../api/auth.js';
import { useEffect, useState } from 'react';
import CreateAgentPage from './agent/CreateAgentPage.jsx';
import CategoryFormPage from './agent/CategoryFormPage.jsx';
import CategoryListPage from './agent/CategoryListPage.jsx';
import CategoryEditPage from './agent/CategoryEditPage.jsx';
import CategoryDeletePage from './agent/CategoryDeletePage.jsx';
import ProductFormPage from './agent/ProductFormPage.jsx';
import ProductsPage from './agent/ProductsPage.jsx';
import ProductArchivePage from './agent/ProductArchivePage.jsx';

function ProtectedRoute({ children }) {
  const [state, setState] = useState('loading');

  useEffect(() => {
    getCurrentUser()
      .then(() => setState('allowed'))
      .catch(() => setState('denied'));
  }, []);

  if (state === 'loading') return <p className="route-loading">Loading...</p>;
  if (state === 'denied') return <Navigate to="/login" replace />;
  return children;
}

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>
      {/* Agent space: every page below is shown inside AgentLayout (<Outlet />) */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<Navigate to="products/new" replace />} />
        <Route path="agents/new" element={<CreateAgentPage />} /> {/* US-08 */}
        <Route path="categories" element={<CategoryListPage />} /> {/* US-10 */}
        <Route path="categories/new" element={<CategoryFormPage />} /> {/* US-11 */}
        <Route path="categories/:id/edit" element={<CategoryEditPage />} /> {/* US-12 */}
        <Route path="categories/:id/delete" element={<CategoryDeletePage />} /> {/* US-13 */}
        <Route path="products" element={<ProductsPage />} /> {/* US-18 */}
        <Route path="products/new" element={<ProductFormPage />} /> {/* US-14 */}
        <Route path="products/:id/edit" element={<ProductFormPage />} /> {/* US-16 */}
        <Route path="products/:id/archive" element={<ProductArchivePage />} /> {/* US-17 */}
      </Route>
      <Route path="/login" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
