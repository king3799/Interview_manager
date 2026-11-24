"use client";

import { useState } from "react";

interface ProfileSettingsProps {
  user: {
    name?: string | null;
    username?: string | null;
    role?: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully!");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "1.5rem" }}>
        Profile Settings
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Profile Information */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            Profile Information
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                Username
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>{user.username}</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                Name
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>{user.name}</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                Role
              </label>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  background: "#d1fae5",
                  color: "#065f46",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            Change Password
          </h2>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", padding: "0.75rem", borderRadius: "0.375rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {success}
              </div>
            )}

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="currentPassword" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="newPassword" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="confirmPassword" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.625rem",
                background: loading ? "#6ee7b7" : "#059669",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#047857";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = "#059669";
              }}
            >
              {loading ? "Changing Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
