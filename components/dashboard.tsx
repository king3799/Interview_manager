"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatToLocalTime, formatDate } from "@/lib/timezone";

interface DashboardStats {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  rejected: number;
  notStarted: number;
  byCountry: { country: string; count: number }[];
  recentInterviews: any[];
}

interface DashboardProps {
  user: {
    role: string;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressStyle = (progress: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      SCHEDULED: { bg: "#dbeafe", color: "#1e40af", label: "Scheduled" },
      PHONE_CALL: { bg: "#ddd6fe", color: "#5b21b6", label: "Phone Call" },
      TEST: { bg: "#fef3c7", color: "#92400e", label: "Test" },
      INITIAL: { bg: "#e0e7ff", color: "#3730a3", label: "Initial" },
      TECHNICAL: { bg: "#ccfbf1", color: "#115e59", label: "Technical" },
      CEO_CTO: { bg: "#d1fae5", color: "#065f46", label: "CEO/CTO" },
      REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
      NOT: { bg: "#f3f4f6", color: "#6b7280", label: "Not Started" },
    };
    return styles[progress] || styles.NOT;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "#6b7280" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "#ef4444" }}>Failed to load dashboard</p>
      </div>
    );
  }

  const isViewer = user.role === "VIEWER";

  return (
    <div>
      <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "1.5rem" }}>
        Dashboard
      </h1>

      {/* Statistics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Total Interviews</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#111827" }}>{stats.total}</p>
            </div>
            <div style={{ width: "3rem", height: "3rem", background: "#dbeafe", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#1e40af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Scheduled</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#1e40af" }}>{stats.scheduled}</p>
            </div>
            <div style={{ width: "3rem", height: "3rem", background: "#dbeafe", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#1e40af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>In Progress</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#d97706" }}>{stats.inProgress}</p>
            </div>
            <div style={{ width: "3rem", height: "3rem", background: "#fef3c7", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#d97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Completed</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#059669" }}>{stats.completed}</p>
            </div>
            <div style={{ width: "3rem", height: "3rem", background: "#d1fae5", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#059669" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Rejected</p>
              <p style={{ fontSize: "2rem", fontWeight: "700", color: "#dc2626" }}>{stats.rejected}</p>
            </div>
            <div style={{ width: "3rem", height: "3rem", background: "#fee2e2", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: "1.5rem", height: "1.5rem", color: "#dc2626" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Top Countries */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
            Top Countries
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.byCountry.map((item, index) => {
              const percentage = (item.count / stats.total) * 100;
              return (
                <div key={item.country}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>{item.country}</span>
                    <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div style={{ width: "100%", height: "0.5rem", background: "#f3f4f6", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ width: `${percentage}%`, height: "100%", background: "#059669", transition: "width 0.3s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Interviews */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827" }}>
              Recent Interviews
            </h2>
            <Link
              href="/interviews"
              style={{ fontSize: "0.875rem", color: "#059669", textDecoration: "none", fontWeight: "500" }}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.recentInterviews.map((interview) => {
              const progressStyle = getProgressStyle(interview.progress);
              return (
                <Link
                  key={interview.id}
                  href={`/interviews/${interview.id}`}
                  style={{
                    display: "block",
                    padding: "0.75rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                    textDecoration: "none",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.25rem" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827", margin: 0 }}>
                      {interview.suggestedRole}
                    </p>
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        background: progressStyle.bg,
                        color: progressStyle.color,
                        borderRadius: "0.25rem",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {progressStyle.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>
                    {interview.country} • {formatToLocalTime(interview.interviewTime, undefined, "MMM dd, HH:mm")}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
