"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserTable } from "./user-table";

interface User {
  id: string;
  username: string;
  name: string;
  location: string | null;
  note: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827" }}>
          User Management
        </h1>
        <Link
          href="/admin/users/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            background: "#059669",
            color: "white",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "0.875rem",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#047857"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#059669"}
        >
          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "0.5rem" }}>
          <p style={{ color: "#6b7280" }}>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "0.5rem" }}>
          <p style={{ color: "#6b7280" }}>No users found</p>
        </div>
      ) : (
        <UserTable users={users} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
