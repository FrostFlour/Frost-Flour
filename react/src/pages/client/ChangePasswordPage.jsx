import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/user.api";
import "./ChangePasswordPage.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess("Password changed successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-header">
          <h1>Change Password</h1>
          <p>Keep your account secure with a strong password.</p>
        </div>

        {success && <div className="cp-success-message">{success}</div>}
        {error && <div className="cp-error-message">{error}</div>}

        <div className="change-password-card">
          <form onSubmit={handleSubmit} className="cp-form">
            <div className="cp-field">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
                className="cp-input"
              />
            </div>

            <div className="cp-field">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                minLength={8}
                required
                className="cp-input"
              />
            </div>

            <div className="cp-field">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                minLength={8}
                required
                className="cp-input"
              />
            </div>

            <div className="cp-actions">
              <button
                type="button"
                className="cp-cancel-button"
                onClick={() => navigate("/profile")}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cp-save-button"
                disabled={loading}
              >
                {loading ? "Saving..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
