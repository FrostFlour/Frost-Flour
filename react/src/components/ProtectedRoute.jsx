import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

export default function ProtectedRoute({ allowedRoles }) {
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      try {
        const data = await getCurrentUser();
        const user = data?.user;

        if (!active) return;

        if (!user) {
          setStatus("unauthenticated");
        } else if (allowedRoles && !allowedRoles.includes(user.role)) {
          setStatus("forbidden");
        } else {
          setStatus("allowed");
        }
      } catch {
        if (active) setStatus("unauthenticated");
      }
    }

    checkAuth();
    return () => {
      active = false;
    };
  }, [allowedRoles]);

  if (status === "loading") {
    return <div style={{ padding: "40px", textAlign: "center" }}>Checking access...</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#633d54" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <Outlet />;
}