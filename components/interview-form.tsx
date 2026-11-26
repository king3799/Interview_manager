"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

interface InterviewFormProps {
  interview?: {
    id: string;
    replyDate: string;
    interviewTime: string;
    timezone?: string;
    country: string;
    suggestedRole: string;
    profileName?: string | null;
    intervieweeName?: string | null;
    note?: string | null;
    resumeUrl?: string | null;
    resumeFilename?: string | null;
    resumeSize?: number | null;
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
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(interview?.resumeUrl || null);
  const [resumeFilename, setResumeFilename] = useState<string | null>(interview?.resumeFilename || null);

  const [formData, setFormData] = useState(() => {
    // Set default reply date to today
    const today = new Date().toISOString().split("T")[0];
    
    return {
      replyDate: interview?.replyDate ? interview.replyDate.split("T")[0] : today,
      interviewTime: interview?.interviewTime ? interview.interviewTime.replace("Z", "").slice(0, 16) : "",
      timezone: interview?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are allowed");
      e.target.value = "";
      return;
    }

    // Validate file size (1MB)
    if (file.size > 1024 * 1024) {
      setError("File size must be less than 1MB");
      e.target.value = "";
      return;
    }

    setError("");
    setResumeFile(file);
  };

  const handleRemoveResume = async () => {
    if (resumeUrl) {
      try {
        await fetch(`/api/upload/delete?url=${encodeURIComponent(resumeUrl)}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting resume:", error);
      }
    }
    setResumeUrl(null);
    setResumeFilename(null);
    setResumeFile(null);
  };

  const uploadResume = async (): Promise<{ url: string; filename: string; size: number } | null> => {
    if (!resumeFile) return null;

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload resume");
      }

      const data = await response.json();
      return { url: data.url, filename: data.filename, size: data.size };
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError(error instanceof Error ? error.message : "Failed to upload resume");
      return null;
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload resume first if there's a new file
      let resumeData = null;
      if (resumeFile) {
        resumeData = await uploadResume();
        if (!resumeData) {
          setLoading(false);
          return; // Upload failed, error already set
        }
      }

      // If there's an existing resume and no new file, keep the existing resume
      const submitData = {
        ...formData,
        resumeUrl: resumeData?.url || resumeUrl,
        resumeFilename: resumeData?.filename || resumeFilename,
        resumeSize: resumeData?.size || interview?.resumeSize,
      };

      const url = mode === "create" ? "/api/interviews" : `/api/interviews/${interview?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
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
              <option value="UTC">UTC (UTC+0)</option>
              <option value="America/New_York">New York (UTC-5/-4)</option>
              <option value="America/Chicago">Chicago (UTC-6/-5)</option>
              <option value="America/Denver">Denver (UTC-7/-6)</option>
              <option value="America/Los_Angeles">Los Angeles (UTC-8/-7)</option>
              <option value="America/Toronto">Toronto (UTC-5/-4)</option>
              <option value="America/Mexico_City">Mexico City (UTC-6/-5)</option>
              <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
              <option value="Europe/London">London (UTC+0/+1)</option>
              <option value="Europe/Paris">Paris (UTC+1/+2)</option>
              <option value="Europe/Berlin">Berlin (UTC+1/+2)</option>
              <option value="Europe/Madrid">Madrid (UTC+1/+2)</option>
              <option value="Europe/Rome">Rome (UTC+1/+2)</option>
              <option value="Europe/Amsterdam">Amsterdam (UTC+1/+2)</option>
              <option value="Europe/Moscow">Moscow (UTC+3)</option>
              <option value="Asia/Dubai">Dubai (UTC+4)</option>
              <option value="Asia/Kolkata">India (UTC+5:30)</option>
              <option value="Asia/Singapore">Singapore (UTC+8)</option>
              <option value="Asia/Hong_Kong">Hong Kong (UTC+8)</option>
              <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
              <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              <option value="Asia/Seoul">Seoul (UTC+9)</option>
              <option value="Australia/Sydney">Sydney (UTC+10/+11)</option>
              <option value="Australia/Melbourne">Melbourne (UTC+10/+11)</option>
              <option value="Pacific/Auckland">Auckland (UTC+12/+13)</option>
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

        {/* Row 4.5: Resume Upload */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="resume" style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>
            Resume (PDF or DOCX, max 1MB)
          </label>
          
          {/* Show existing resume or file input */}
          {resumeUrl || resumeFile ? (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem",
              padding: "0.75rem",
              background: "#f0fdf4",
              border: "2px solid #bbf7d0",
              borderRadius: "0.5rem"
            }}>
              <svg style={{ width: "1.25rem", height: "1.25rem", color: "#059669", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span style={{ flex: 1, fontSize: "0.875rem", color: "#374151" }}>
                {resumeFile?.name || resumeFilename || "Resume attached"}
              </span>
              <button
                type="button"
                onClick={handleRemoveResume}
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fef2f2"}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <input
                type="file"
                id="resume"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "2px dashed #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
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
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.5rem" }}>
                Supported formats: PDF, DOCX (max 1MB)
              </p>
            </div>
          )}
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

        {/* Submit Button */}
        <div style={{ marginTop: "2rem" }}>
          <button
            type="submit"
            disabled={loading || uploadingResume}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              background: (loading || uploadingResume) ? "#6ee7b7" : "#059669",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: (loading || uploadingResume) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (!loading && !uploadingResume) e.currentTarget.style.background = "#047857";
            }}
            onMouseLeave={(e) => {
              if (!loading && !uploadingResume) e.currentTarget.style.background = "#059669";
            }}
          >
            {uploadingResume ? "Uploading resume..." : loading ? "Saving..." : mode === "create" ? "Create Interview" : "Update Interview"}
          </button>
        </div>
      </div>
    </form>
  );
}
