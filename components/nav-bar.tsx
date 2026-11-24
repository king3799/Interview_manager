"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface NavBarProps {
  user: {
    name?: string | null;
    username?: string | null;
    role?: string | null;
  };
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();

  const isAdmin = user.role === "ADMIN";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getLinkStyle = (isActive: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "0.5rem 0.75rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    borderRadius: "0.375rem",
    textDecoration: "none",
    color: isActive ? "#047857" : "#374151",
    background: isActive ? "#d1fae5" : "transparent",
    transition: "all 0.2s",
  });

  return (
    <nav style={{ background: "white", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", borderBottom: "1px solid #e5e7eb" }}>
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "0 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", height: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <Link
              href="/interviews"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0 0.5rem",
                color: "#059669",
                fontWeight: "700",
                fontSize: "1.25rem",
                textDecoration: "none"
              }}
            >
              <svg
                style={{ width: "1.5rem", height: "1.5rem" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Interview Manager
            </Link>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link
                href="/dashboard"
                style={getLinkStyle(pathname === "/dashboard")}
                onMouseEnter={(e) => {
                  if (pathname !== "/dashboard") {
                    e.currentTarget.style.background = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== "/dashboard") {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                Dashboard
              </Link>

              <Link
                href="/interviews"
                style={getLinkStyle(pathname.startsWith("/interviews"))}
                onMouseEnter={(e) => {
                  if (!pathname.startsWith("/interviews")) {
                    e.currentTarget.style.background = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pathname.startsWith("/interviews")) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                Interviews
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/users"
                  style={getLinkStyle(pathname.startsWith("/admin"))}
                  onMouseEnter={(e) => {
                    if (!pathname.startsWith("/admin")) {
                      e.currentTarget.style.background = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!pathname.startsWith("/admin")) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  Users
                </Link>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.875rem", color: "#374151" }}>
              {user.name}
              <span
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  borderRadius: "9999px",
                  background: "#d1fae5",
                  color: "#065f46"
                }}
              >
                {user.role}
              </span>
            </span>
            <button
              onClick={handleSignOut}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "white",
                background: "#059669",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#047857"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#059669"}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
