"use client";

import { formatStoredTime, formatToLocalTime } from "@/lib/timezone";

interface InterviewTimeProps {
  interviewTime: string;
  timezone?: string;
  format?: string;
  showTimezone?: boolean;
  style?: React.CSSProperties;
}

export function InterviewTime({ 
  interviewTime, 
  timezone, 
  format = "yyyy-MM-dd HH:mm",
  showTimezone = false,
  style = {}
}: InterviewTimeProps) {
  const storedTime = formatStoredTime(interviewTime, format);
  const localTime = formatToLocalTime(interviewTime, undefined, format);
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <span 
      title={`Local time (${browserTimezone}): ${localTime}`}
      style={{ 
        cursor: "help",
        ...style
      }}
    >
      {storedTime}
      {showTimezone && timezone && (
        <span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "0.5rem" }}>
          ({timezone})
        </span>
      )}
    </span>
  );
}
