"use client";

import Link from "next/link";
import { DeleteUserButton } from "./delete-user-button";
import { formatDate } from "@/lib/timezone";

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

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const getRoleBadge = (role: string) => {
    const badges: Record<string, { bg: string; color: string; label: string }> = {
      ADMIN: { bg: "#fee2e2", color: "#991b1b", label: "Admin" },
      BIDDER: { bg: "#dbeafe", color: "#1e40af", label: "Bidder" },
      VIEWER: { bg: "#f3f4f6", color: "#6b7280", label: "Viewer" },
    };
    return badges[role] || badges.VIEWER;
  };

  return (
    <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <tr>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Username</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Name</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Role</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Created</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600", color: "#374151" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              return (
                <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem", color: "#374151", fontWeight: "500" }}>
                    {user.username}
                  </td>
                  <td style={{ padding: "1rem", color: "#374151" }}>{user.name}</td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {roleBadge.label}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#6b7280" }}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        style={{
                          padding: "0.375rem 0.75rem",
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "0.375rem",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          fontWeight: "500"
                        }}
                      >
                        Edit
                      </Link>
                      <DeleteUserButton
                        userId={user.id}
                        username={user.username}
                        onSuccess={onRefresh}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
