"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { InterviewTable } from "./interview-table";

interface Interview {
  id: string;
  replyDate: string;
  interviewTime: string;
  country: string;
  suggestedRole: string;
  profileName?: string | null;
  intervieweeName?: string | null;
  note?: string | null;
  mailUrl: string | null;
  jobUrl: string | null;
  meetingUrl: string | null;
  progress: string;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
    name: string;
  };
}

interface InterviewListProps {
  user: {
    id: string;
    role: string;
  };
}

export function InterviewList({ user }: InterviewListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<{ id: string; username: string; name: string }[]>([]);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    progress: searchParams.get("progress") || "",
    country: searchParams.get("country") || "",
    createdBy: searchParams.get("createdBy") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  const canAdd = user.role === "ADMIN" || user.role === "BIDDER";
  const isViewer = user.role === "VIEWER";

  useEffect(() => {
    fetchInterviews();
    if (!isViewer) {
      fetchUsers();
    }
  }, [searchParams]);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/interviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });

    router.push(`/interviews?${params}`);
  };

  const handleReset = () => {
    setFilters({
      q: "",
      progress: "",
      country: "",
      createdBy: "",
      startDate: "",
      endDate: "",
    });
    router.push("/interviews");
  };

  // Pagination
  const totalPages = Math.ceil(interviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterviews = interviews.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExportToExcel = () => {
    // Create CSV content
    const headers = ["No.", "Reply Date", "Interview Time", "Country", "Role", "Profile Name", "Interviewee Name", "Progress", "Mail URL", "Job URL", "Meeting URL"];
    if (!isViewer) {
      headers.push("Created By");
    }
    
    const rows = interviews.map((interview, index) => {
      const row = [
        index + 1,
        new Date(interview.replyDate).toLocaleDateString(),
        new Date(interview.interviewTime).toLocaleString(),
        interview.country,
        interview.suggestedRole,
        interview.profileName || "",
        interview.intervieweeName || "",
        interview.progress,
        interview.mailUrl || "",
        interview.jobUrl || "",
        interview.meetingUrl || "",
      ];
      
      if (!isViewer && interview.creator) {
        row.push(`${interview.creator.name} (@${interview.creator.username})`);
      }
      
      return row;
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `interviews_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827" }}>
            Interviews
          </h1>
          {!loading && (
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Showing {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {interviews.length > 0 && (
            <button
              onClick={handleExportToExcel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "white",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontWeight: "600",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to Excel
            </button>
          )}
          {canAdd && (
            <Link
              href="/interviews/new"
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
              Add Interview
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Row 1: Search, Progress, Country */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px", minWidth: "200px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Search
              </label>
              <input
                type="text"
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                placeholder="Search role, country, URLs..."
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Progress
              </label>
              <select
                value={filters.progress}
                onChange={(e) => handleFilterChange("progress", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              >
                <option value="">All</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="TEST">Test</option>
                <option value="INITIAL">Initial</option>
                <option value="TECHNICAL">Technical</option>
                <option value="CEO_CTO">CEO/CTO</option>
                <option value="REJECTED">Rejected</option>
                <option value="NOT">Not Started</option>
              </select>
            </div>

            <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Country
              </label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => handleFilterChange("country", e.target.value)}
                placeholder="Filter by country"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>
          </div>

          {/* Row 2: Date Range, Created By, Reset Button */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
            </div>

            {!isViewer && (
              <div style={{ flex: "1 1 150px", minWidth: "150px" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
                  Created By
                </label>
                <select
                  value={filters.createdBy}
                  onChange={(e) => handleFilterChange("createdBy", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem"
                  }}
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleReset}
              style={{
                padding: "0.5rem 1.5rem",
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                height: "38px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e5e7eb";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "0.5rem", minHeight: "550px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading interviews...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "0.5rem", minHeight: "550px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b7280" }}>No interviews found</p>
        </div>
      ) : (
        <>
          <InterviewTable 
            interviews={currentInterviews} 
            user={user} 
            onRefresh={fetchInterviews} 
            startIndex={startIndex}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "0.5rem 1rem",
                  background: currentPage === 1 ? "#f3f4f6" : "white",
                  color: currentPage === 1 ? "#9ca3af" : "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.background = "white";
                  }
                }}
              >
                Previous
              </button>

              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: "0.5rem 1rem",
                  background: currentPage === totalPages ? "#f3f4f6" : "white",
                  color: currentPage === totalPages ? "#9ca3af" : "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.background = "white";
                  }
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
