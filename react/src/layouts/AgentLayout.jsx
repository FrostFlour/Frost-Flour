// import { Link, Outlet } from "react-router-dom";
// //import "./MainLayout.css";

// export default function AgentLayout() {
//   return (
//     <div className="main-layout">
//       <header className="main-header">
//         <div className="header-container">
//           <Link to="/agent/clients" className="logo">
//             <h1>Frost &amp; Flour · Staff</h1>
//           </Link>

//           <nav className="main-nav">
//             <Link to="/agent/clients">Clients</Link>
//             <Link to="/profile">Profile</Link>
//           </nav>
//         </div>
//       </header>

//       <main className="main-content">
//         <Outlet />
//       </main>

//       <footer className="main-footer">
//         <div className="footer-container">
//           <p>&copy; 2026 Frost &amp; Flour. All rights reserved.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }
// US-11 (task 6): the layout of the Agent space (sidebar menu + page content).
// Every agent page (US-08, US-11, US-14) is shown inside this layout,
// in the place of <Outlet />.
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getMe } from "../api/user.api";
import { logoutUser } from "../api/auth";
import "./AgentLayout.css";

export default function AgentLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // the logged-in agent (null while loading)

  // When the layout appears, ask the API who is logged in.
  // - not logged in        -> go to the login page
  // - logged in but Client -> go away (the agent menu is never shown to clients)
  useEffect(() => {
    getMe()
      .then((data) => {
        if (data.user.role !== "Agent") navigate("/profile", { replace: true });
        else setUser(data.user);
      })
      .catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser().catch(() => {}); // the server deletes the cookie
    navigate("/login");
  };

  // Show nothing until we know the user is an Agent
  if (!user) return <p className="agent-loading">Loading...</p>;

  return (
    <div className="agent-layout">
      {/* ---------- Left menu ---------- */}
      <aside className="agent-sidebar">
        <div className="agent-brand">
          <strong>Frost &amp; Flour</strong>
          <span>BAKED WITH CARE</span>
        </div>

        <p className="agent-menu-title">BAKERY WORKSPACE</p>
        {/* NavLink adds the "active" class to the link of the current page */}
        <nav className="agent-menu">
          <NavLink to="/agent/products/new">Products</NavLink>
          <NavLink to="/agent/categories">Categories</NavLink>
          <NavLink to="/agent/agents/new">Team</NavLink>
        </nav>

        <button type="button" className="agent-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* ---------- Right part: top bar + current page ---------- */}
      <div className="agent-main">
        <header className="agent-topbar">
          <span>Bakery workspace</span>
          <span className="agent-user">
            {user.firstName} {user.lastName}
            <small>Bakery agent</small>
          </span>
        </header>

        <main className="agent-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
