import { useState, useEffect } from "react";
import { getMe } from "../../api/user.api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMe();
      setUser(data.user);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={loadProfile} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <div className="profile-field">
            <label>First Name</label>
            <p>{user?.firstName}</p>
          </div>

          <div className="profile-field">
            <label>Last Name</label>
            <p>{user?.lastName}</p>
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>

          <div className="profile-field">
            <label>Phone</label>
            <p>{user?.phone}</p>
          </div>

          {user?.address && (
            <div className="profile-field">
              <label>Address</label>
              <p>{user.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
