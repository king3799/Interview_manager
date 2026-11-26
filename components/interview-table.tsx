"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/timezone";
import { DeleteInterviewButton } from "./delete-interview-button";
import { InterviewTime } from "./interview-time";

interface Interview {
  id: string;
  replyDate: string;
  interviewTime: string;
  timezone?: string;
  country: string;
  suggestedRole: string;
  progress: string;
  creator?: {
    username: string;
    name: string;
  };
}

interface InterviewTableProps {
  interviews: Interview[];
  user: {
    id: string;
    role: string;
  };
  onRefresh: () => void;
  startIndex?: number; // For row numbering across pages
  sortConfig?: {
    key: "replyDate" | "interviewTime" | "country" | "createdBy";
    direction: "asc" | "desc";
  } | null;
  onSort?: (key: "replyDate" | "interviewTime" | "country" | "createdBy") => void;
}

export function InterviewTable({ interviews, user, onRefresh, startIndex = 0, sortConfig, onSort }: InterviewTableProps) {
  const isViewer = user.role === "VIEWER";
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getSortIcon = (columnKey: "replyDate" | "interviewTime" | "country" | "createdBy") => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg style={{ width: "0.875rem", height: "0.875rem", opacity: 0.3, flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortConfig.direction === "asc") {
      return (
        <svg style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    }

    return (
      <svg style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
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

  return (
    <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <tr>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151", width: "60px" }}>No.</th>
              <th 
                style={{ 
                  padding: "0.75rem 1rem", 
                  textAlign: "left", 
                  fontWeight: "600", 
                  color: "#374151", 
                  cursor: "pointer", 
                  userSelect: "none",
                  whiteSpace: "nowrap"
                }}
                onClick={() => onSort && onSort("replyDate")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Reply Date {getSortIcon("replyDate")}
                </div>
              </th>
              <th 
                style={{ 
                  padding: "0.75rem 1rem", 
                  textAlign: "left", 
                  fontWeight: "600", 
                  color: "#374151", 
                  cursor: "pointer", 
                  userSelect: "none",
                  whiteSpace: "nowrap"
                }}
                onClick={() => onSort && onSort("interviewTime")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Interview Time {getSortIcon("interviewTime")}
                </div>
              </th>
              <th 
                style={{ 
                  padding: "0.75rem 1rem", 
                  textAlign: "left", 
                  fontWeight: "600", 
                  color: "#374151", 
                  cursor: "pointer", 
                  userSelect: "none",
                  whiteSpace: "nowrap"
                }}
                onClick={() => onSort && onSort("country")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  Country {getSortIcon("country")}
                </div>
              </th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>Role</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>Progress</th>
              {!isViewer && (
                <th 
                  style={{ 
                    padding: "0.75rem 1rem", 
                    textAlign: "left", 
                    fontWeight: "600", 
                    color: "#374151", 
                    cursor: "pointer", 
                    userSelect: "none",
                    whiteSpace: "nowrap"
                  }}
                  onClick={() => onSort && onSort("createdBy")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    Created By {getSortIcon("createdBy")}
                  </div>
                </th>
              )}
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600", color: "#374151", whiteSpace: "nowrap" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview, index) => {
              const progressStyle = getProgressStyle(interview.progress);
              const isHovered = hoveredRow === interview.id;
              return (
                <tr 
                  key={interview.id} 
                  style={{ 
                    borderBottom: "1px solid #e5e7eb",
                    background: isHovered ? "#f9fafb" : "white",
                    cursor: "pointer",
                    transition: "background 0.15s"
                  }}
                  onClick={() => window.location.href = `/interviews/${interview.id}`}
                  onMouseEnter={() => setHoveredRow(interview.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: "1rem", color: "#6b7280", fontWeight: "500", whiteSpace: "nowrap" }}>
                    {startIndex + index + 1}
                  </td>
                  <td style={{ 
                    padding: "1rem", 
                    color: "#374151",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    maxWidth: "150px"
                  }}>
                    {formatDate(interview.replyDate)}
                  </td>
                  <td style={{ 
                    padding: "1rem", 
                    color: "#374151",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    maxWidth: "220px"
                  }}>
                    <InterviewTime 
                      interviewTime={interview.interviewTime}
                      timezone={interview.timezone}
                      format="yyyy-MM-dd HH:mm"
                      showTimezone={true}
                    />
                  </td>
                  <td style={{ 
                    padding: "1rem", 
                    color: "#374151",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    maxWidth: "120px"
                  }}>
                    {interview.country}
                  </td>
                  <td style={{ 
                    padding: "1rem", 
                    color: "#374151",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                    maxWidth: "250px"
                  }}>
                    <span title={interview.suggestedRole}>
                      {interview.suggestedRole}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: progressStyle.bg,
                        color: progressStyle.color,
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        maxWidth: "120px"
                      }}
                      title={progressStyle.label}
                    >
                      {progressStyle.label}
                    </span>
                  </td>
                  {!isViewer && (
                    <td style={{ 
                      padding: "1rem", 
                      color: "#6b7280",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                      maxWidth: "150px"
                    }}>
                      <span title={interview.creator?.username || "Unknown"}>
                        {interview.creator?.username || "Unknown"}
                      </span>
                    </td>
                  )}
                  <td style={{ padding: "1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                    <div 
                      style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/interviews/${interview.id}`}
                        style={{
                          padding: "0.375rem 0.75rem",
                          background: "#f3f4f6",
                          color: "#374151",
                          borderRadius: "0.375rem",
                          textDecoration: "none",
                          fontSize: "0.75rem",
                          fontWeight: "500",
                          whiteSpace: "nowrap"
                        }}
                      >
                        View
                      </Link>
                      {!isViewer && (
                        <DeleteInterviewButton
                          interviewId={interview.id}
                          variant="icon"
                          onSuccess={onRefresh}
                        />
                      )}
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
