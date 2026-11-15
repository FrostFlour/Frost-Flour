import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';

function BlankDashboard() {
  return <main aria-label="Dashboard" />;
}

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<BlankDashboard />} />
      <Route path="*" element={<App />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
