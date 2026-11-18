import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import "./MainLayout.css";

export default function MainLayout() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutUser().catch(() => {});
    navigate("/login", { replace: true });
  };

  return (
    <div className="main-layout">
      <header className="main-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <h1>Frost & Flour</h1>
          </Link>
          
          <nav className="main-nav">
            <Link to="/catalog">Catalog</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/cart">Cart</Link>
            <button type="button" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-container">
          <p>&copy; 2026 Frost & Flour. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
