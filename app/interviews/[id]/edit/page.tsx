"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { NavBar } from "@/components/nav-bar";
import { InterviewForm } from "@/components/interview-form";

export default function InterviewEditPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`/api/interviews/${params.id}`);
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

    if (params.id && status === "authenticated") {
      fetchInterview();
    }
  }, [params.id, status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
        {session?.user && <NavBar user={session.user} />}
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (error || !interview) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column" }}>
        <NavBar user={session.user} />
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error || "Interview not found"}</p>
          <button
            onClick={() => router.push("/interviews")}
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
      <NavBar user={session.user} />
      <main style={{ flex: 1, maxWidth: "80rem", width: "100%", margin: "0 auto", padding: "2rem", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#111827", marginBottom: "0.5rem" }}>
              {interview.profileName}
            </h1>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
              <span>
                <strong>Time:</strong> {new Date(interview.interviewTime).toLocaleString('en-US', { 
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: interview.timezone
                })}
              </span>
              <span>•</span>
              <span>
                <strong>Role:</strong> {interview.suggestedRole}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push(`/interviews/${params.id}`)}
            style={{
              padding: "0.5rem 1rem",
              background: "#059669",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#047857"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#059669"}
          >
            Back
          </button>
        </div>

        <div style={{ flex: 1, background: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)", padding: "2rem", display: "flex", flexDirection: "column" }}>
          <InterviewForm interview={interview} mode="edit" />
        </div>
      </main>
    </div>
  );
}
