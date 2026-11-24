"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="username"
          style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          style={{ 
            width: "100%", 
            padding: "0.625rem 1rem", 
            border: "2px solid #d1d5db", 
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            outline: "none",
            transition: "all 0.2s",
            backgroundColor: "#ffffff"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
            e.target.style.boxShadow = "none";
          }}
          placeholder="Enter username"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{ 
            width: "100%", 
            padding: "0.625rem 1rem", 
            border: "2px solid #d1d5db", 
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            outline: "none",
            transition: "all 0.2s",
            backgroundColor: "#ffffff"
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#059669";
            e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#d1d5db";
            e.target.style.boxShadow = "none";
          }}
          placeholder="Enter password"
          disabled={isLoading}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
        <button
          type="submit"
          disabled={isLoading}
          style={{ 
            background: isLoading ? "#6ee7b7" : "#059669",
            color: "white",
            fontWeight: "600",
            padding: "0.625rem 2rem",
            borderRadius: "0.5rem",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "0.875rem",
            transition: "all 0.2s",
            minWidth: "120px"
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = "#047857";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = "#059669";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </form>
  );
}
