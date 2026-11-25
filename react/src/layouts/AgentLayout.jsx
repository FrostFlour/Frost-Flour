import { Link, Outlet } from "react-router-dom";
import "./MainLayout.css";

export default function AgentLayout() {
  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-container">
          <Link to="/agent/clients" className="logo">
            <h1>Frost &amp; Flour · Staff</h1>
          </Link>

          <nav className="main-nav">
            <Link to="/agent/clients">Clients</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-container">
          <p>&copy; 2026 Frost &amp; Flour. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}