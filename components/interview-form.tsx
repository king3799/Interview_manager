"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

interface InterviewFormProps {
  interview?: {
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
  };
  mode: "create" | "edit";
}

export function InterviewForm({ interview, mode }: InterviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(() => {
    // Set default reply date to today
    const today = new Date().toISOString().split("T")[0];
    
    return {
      replyDate: interview?.replyDate ? interview.replyDate.split("T")[0] : today,
      interviewTime: interview?.interviewTime ? interview.interviewTime.replace("Z", "").slice(0, 16) : "",
      timezone: interview?.interviewTime ? "UTC" : Intl.DateTimeFormat().resolvedOptions().timeZone,
      country: interview?.country || "",
      suggestedRole: interview?.suggestedRole || "",
      profileName: interview?.profileName || "",
      intervieweeName: interview?.intervieweeName || "",
      note: interview?.note || "",
      mailUrl: interview?.mailUrl || "",
      jobUrl: interview?.jobUrl || "",
      meetingUrl: interview?.meetingUrl || "",
      progress: interview?.progress || "NOT",
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = mode === "create" ? "/api/interviews" : `/api/interviews/${interview?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (mode === "edit") {
          router.push(`/interviews/${interview?.id}`);
        } else {
          router.push("/interviews");
        }
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save interview");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/interviews");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "0.75rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}


        {/* Row 2: Country, Profile Name, Interviewee Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <label htmlFor="profileName" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Profile Name
            </label>
            <input
              type="text"
              id="profileName"
              name="profileName"
              value={formData.profileName}
              onChange={handleChange}
              placeholder="e.g., LinkedIn Profile"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label htmlFor="intervieweeName" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Interviewee Name
            </label>
            <input
              type="text"
              id="intervieweeName"
              name="intervieweeName"
              value={formData.intervieweeName}
              onChange={handleChange}
              placeholder="e.g., John Smith"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label htmlFor="country" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Job Country <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 1: Reply Date, Interview Time, Timezone, Progress */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>

          <div>
            <label htmlFor="interviewTime" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Interview Time <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="datetime-local"
              id="interviewTime"
              name="interviewTime"
              value={formData.interviewTime}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label htmlFor="timezone" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Timezone <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">New York (GMT-5/-4)</option>
              <option value="America/Los_Angeles">Los Angeles (GMT-8/-7)</option>
              <option value="Europe/London">London (GMT+0/+1)</option>
              <option value="Europe/Paris">Paris (GMT+1/+2)</option>
              <option value="Asia/Seoul">Seoul (GMT+9)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              <option value="Asia/Shanghai">Shanghai (GMT+8)</option>
              <option value="Asia/Dubai">Dubai (GMT+4)</option>
              <option value="Australia/Sydney">Sydney (GMT+10/+11)</option>
            </select>
          </div>

          <div>
            <label htmlFor="replyDate" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Reply Date <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="date"
              id="replyDate"
              name="replyDate"
              value={formData.replyDate}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label htmlFor="progress" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
              Progress Status
            </label>
            <select
              id="progress"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "2px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#059669";
                e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="NOT">Not Started</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PHONE_CALL">Phone Call</option>
              <option value="TEST">Test</option>
              <option value="INITIAL">Initial Interview</option>
              <option value="TECHNICAL">Technical Interview</option>
              <option value="CEO_CTO">CEO/CTO Interview</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>


        {/* Row 3: Suggested Role (full width) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="suggestedRole" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Suggested Role <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="text"
            id="suggestedRole"
            name="suggestedRole"
            value={formData.suggestedRole}
            onChange={handleChange}
            required
            placeholder="e.g., Senior Full Stack Developer"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Row 4: Note (full width) */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="note" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Note
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            placeholder="Add any additional notes..."
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s",
              resize: "vertical"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Row 5: Mail URL */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="mailUrl" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Mail URL
          </label>
          <input
            type="url"
            id="mailUrl"
            name="mailUrl"
            value={formData.mailUrl}
            onChange={handleChange}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Row 6: Job URL */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="jobUrl" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Job URL
          </label>
          <input
            type="url"
            id="jobUrl"
            name="jobUrl"
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Row 7: Meeting URL */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="meetingUrl" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Meeting URL
          </label>
          <input
            type="url"
            id="meetingUrl"
            name="meetingUrl"
            value={formData.meetingUrl}
            onChange={handleChange}
            placeholder="https://..."
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "2px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#059669";
              e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingTop: "2rem", borderTop: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: "0.625rem 1.5rem",
            background: "white",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.625rem 1.5rem",
            background: loading ? "#6ee7b7" : "#059669",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#047857";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "#059669";
          }}
        >
          {loading ? "Saving..." : mode === "create" ? "Create Interview" : "Update Interview"}
        </button>
      </div>
    </form>
  );
}
