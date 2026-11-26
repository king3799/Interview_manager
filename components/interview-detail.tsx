"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  profileName: string | null;
  intervieweeName: string | null;
  note: string | null;
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
  createdAt: string;
  updatedAt: string;
}

interface InterviewDetailProps {
  interviewId: string;
  user: {
    id: string;
    role: string;
  };
}

export function InterviewDetail({ interviewId, user }: InterviewDetailProps) {
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`);
      if (response.ok) {
        const data = await response.json();
        setInterview(data);
      } else {
        setError("Failed to load interview");
      }
    } catch (error) {
      console.error("Error fetching interview:", error);
      setError("Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const getProgressStyle = (progress: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      SCHEDULED: { bg: "#dbeafe", color: "#1e40af", label: "Scheduled" },
      PHONE_CALL: { bg: "#ddd6fe", color: "#5b21b6", label: "Phone Call" },
      TEST: { bg: "#fef3c7", color: "#92400e", label: "Test" },
      INITIAL: { bg: "#e0e7ff", color: "#3730a3", label: "Initial Interview" },
      TECHNICAL: { bg: "#ccfbf1", color: "#115e59", label: "Technical Interview" },
      CEO_CTO: { bg: "#d1fae5", color: "#065f46", label: "CEO/CTO Interview" },
      REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
      NOT: { bg: "#f3f4f6", color: "#6b7280", label: "Not Started" },
    };
    return styles[progress] || styles.NOT;
  };

  const canEdit =
    user.role === "ADMIN" ||
    (user.role === "BIDDER" && interview?.createdBy === user.id);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error || "Interview not found"}</p>
        <Link
          href="/interviews"
          style={{
            color: "#059669",
            textDecoration: "underline"
          }}
        >
          Back to list
        </Link>
      </div>
    );
  }

  const progressStyle = getProgressStyle(interview.progress);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <Link
            href="/interviews"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#6b7280",
              fontSize: "0.875rem",
              textDecoration: "none",
              marginBottom: "0.5rem"
            }}
          >
            <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to list
          </Link>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827" }}>
            Interview Details
          </h1>
        </div>
        {canEdit && (
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Link
              href={`/interviews/${interview.id}/edit`}
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
              <svg style={{ width: "1rem", height: "1rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <DeleteInterviewButton
              interviewId={interview.id}
              variant="button"
              redirectAfterDelete={true}
            />
          </div>
        )}
      </div>

      <div style={{ background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                Reply Date
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>
                {formatDate(interview.replyDate)}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                Interview Time
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>
                <InterviewTime 
                  interviewTime={interview.interviewTime}
                  timezone={interview.timezone}
                  format="yyyy-MM-dd HH:mm"
                  showTimezone={true}
                />
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                Country
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>
                {interview.country}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                Progress Status
              </label>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: progressStyle.bg,
                  color: progressStyle.color,
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                {progressStyle.label}
              </span>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                Suggested Role
              </label>
              <p style={{ fontSize: "1rem", color: "#111827" }}>
                {interview.suggestedRole}
              </p>
            </div>

            {interview.profileName && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Profile Name
                </label>
                <p style={{ fontSize: "1rem", color: "#111827" }}>
                  {interview.profileName}
                </p>
              </div>
            )}

            {interview.intervieweeName && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Interviewee Name
                </label>
                <p style={{ fontSize: "1rem", color: "#111827" }}>
                  {interview.intervieweeName}
                </p>
              </div>
            )}

            {interview.note && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Note
                </label>
                <p style={{ fontSize: "1rem", color: "#111827", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                  {interview.note}
                </p>
              </div>
            )}

            {user.role !== "VIEWER" && interview.creator && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.5rem" }}>
                  Created By
                </label>
                <p style={{ fontSize: "1rem", color: "#111827" }}>
                  {interview.creator.name} (@{interview.creator.username})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* URLs Section */}
        {(interview.mailUrl || interview.jobUrl || interview.meetingUrl) && (
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#111827", marginBottom: "1rem" }}>
              Related Links
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {interview.mailUrl && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Mail URL
                  </label>
                  <a
                    href={interview.mailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#059669",
                      textDecoration: "underline",
                      fontSize: "0.875rem",
                      wordBreak: "break-all"
                    }}
                  >
                    {interview.mailUrl}
                  </a>
                </div>
              )}
              {interview.jobUrl && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Job URL
                  </label>
                  <a
                    href={interview.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#059669",
                      textDecoration: "underline",
                      fontSize: "0.875rem",
                      wordBreak: "break-all"
                    }}
                  >
                    {interview.jobUrl}
                  </a>
                </div>
              )}
              {interview.meetingUrl && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Meeting URL
                  </label>
                  <a
                    href={interview.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#059669",
                      textDecoration: "underline",
                      fontSize: "0.875rem",
                      wordBreak: "break-all"
                    }}
                  >
                    {interview.meetingUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
