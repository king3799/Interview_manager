"use client";

import { useState } from "react";
import Link from "next/link";
import { formatToLocalTime, formatDate } from "@/lib/timezone";
import { DeleteInterviewButton } from "./delete-interview-button";

interface Interview {
  id: string;
  replyDate: string;
  interviewTime: string;
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
}

export function InterviewTable({ interviews, user, onRefresh, startIndex = 0 }: InterviewTableProps) {
  const isViewer = user.role === "VIEWER";

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
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Reply Date</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Interview Time</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Country</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Role</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Progress</th>
              {!isViewer && (
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: "600", color: "#374151" }}>Created By</th>
              )}
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: "600", color: "#374151" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview, index) => {
              const progressStyle = getProgressStyle(interview.progress);
              return (
                <tr key={interview.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem", color: "#6b7280", fontWeight: "500" }}>
                    {startIndex + index + 1}
                  </td>
                  <td style={{ padding: "1rem", color: "#374151" }}>
                    {formatDate(interview.replyDate)}
                  </td>
                  <td style={{ padding: "1rem", color: "#374151" }}>
                    {formatToLocalTime(interview.interviewTime, undefined, "yyyy-MM-dd HH:mm")}
                  </td>
                  <td style={{ padding: "1rem", color: "#374151" }}>{interview.country}</td>
                  <td style={{ padding: "1rem", color: "#374151" }}>{interview.suggestedRole}</td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: progressStyle.bg,
                        color: progressStyle.color,
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: "600"
                      }}
                    >
                      {progressStyle.label}
                    </span>
                  </td>
                  {!isViewer && (
                    <td style={{ padding: "1rem", color: "#6b7280" }}>
                      {interview.creator?.username || "Unknown"}
                    </td>
                  )}
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link
                        href={`/interviews/${interview.id}`}
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
