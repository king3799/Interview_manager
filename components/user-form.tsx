"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserFormProps {
  user?: {
    id: string;
    username: string;
    name: string;
    location: string | null;
    note: string | null;
    role: string;
  };
  mode: "create" | "edit";
}

export function UserForm({ user, mode }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: user?.username || "",
    name: user?.name || "",
    note: user?.note || "",
    role: user?.role || "VIEWER",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate password for create mode
    if (mode === "create" && !formData.password) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const url = mode === "create" ? "/api/users" : `/api/users/${user?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save user");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/users");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {/* Row 1: Username, Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label htmlFor="username" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Username <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="e.g., john.doe"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Full Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., John Doe"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Row 2: Role, Password */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label htmlFor="role" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Role <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="VIEWER">Viewer</option>
              <option value="BIDDER">Bidder</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Password {mode === "create" && <span style={{ color: "#dc2626" }}>*</span>}
              {mode === "edit" && <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "#6b7280" }}> (leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={mode === "create"}
              placeholder={mode === "create" ? "Enter initial password" : "Enter new password"}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {/* Row 3: Note */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="note" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Note
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            placeholder="Optional notes about this user"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              resize: "vertical"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingTop: "2rem", borderTop: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: "0.625rem 1.5rem",
            background: "white",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.625rem 1.5rem",
            background: loading ? "#6ee7b7" : "#059669",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#047857";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "#059669";
          }}
        >
          {loading ? "Saving..." : mode === "create" ? "Create User" : "Update User"}
        </button>
      </div>
    </form>
  );
}
