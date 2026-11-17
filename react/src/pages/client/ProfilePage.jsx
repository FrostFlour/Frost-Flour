import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMe, updateMe, updateClient } from "../../api/user.api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getMe();
      const userData = data.user;
      setUser(userData);
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      await loadProfile();
    };

    initializeProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update user data (firstName, lastName)
      await updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Update client data (phone, address)
      await updateClient({
        phone: formData.phone,
        address: formData.address,
      });

      // Reload profile to get updated data
      await loadProfile();
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
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

  if (error && !user) {
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
        <div className="profile-header">
          <h1>My Profile</h1>
          {!isEditing && (
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="profile-card">
          <div className="profile-field">
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <p>{user?.firstName}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="edit-input"
              />
            ) : (
              <p>{user?.lastName}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Email</label>
            <p className="email-field">{user?.email}</p>
          </div>

          <div className="profile-field">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="edit-input"
                placeholder="Enter phone number"
              />
            ) : (
              <p>{user?.phone || "-"}</p>
            )}
          </div>

          <div className="profile-field">
            <label>Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="edit-textarea"
                placeholder="Enter address"
                rows="3"
              />
            ) : (
              <p>{user?.address || "-"}</p>
            )}
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="save-button"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
        <div className="change-password-link">
          <Link to="/change-password" className="change-password-button">
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}