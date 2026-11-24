"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { UserForm } from "@/components/user-form";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setError("Failed to load user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error || "User not found"}</p>
          <button
            onClick={() => router.push("/admin/users")}
            style={{
              padding: "0.5rem 1rem",
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, maxWidth: "80rem", width: "100%", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
            Edit User
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Update user information. Leave password blank to keep the current password.
          </p>
        </div>

        <div style={{ flex: 1, background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", padding: "2rem", display: "flex", flexDirection: "column" }}>
          <UserForm user={user} mode="edit" />
        </div>
      </main>
    </div>
  );
}
