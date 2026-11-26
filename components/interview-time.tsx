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

  // Extract UTC offset from Etc/GMT format or calculate from timezone
  const getUTCOffset = (tz: string) => {
    if (!tz) return 'UTC+0';
    
    // Handle Etc/GMT format (e.g., "Etc/GMT-11" means UTC+11)
    if (tz.startsWith('Etc/GMT')) {
      const match = tz.match(/Etc\/GMT([+-]?\d+(?::\d+)?)/);
      if (match) {
        const offset = match[1];
        // Etc/GMT has inverted sign: Etc/GMT-11 = UTC+11
        if (offset.startsWith('+')) {
          return `UTC-${offset.substring(1)}`;
        } else if (offset.startsWith('-')) {
          return `UTC+${offset.substring(1)}`;
        } else {
          return `UTC+${offset}`;
        }
      }
    }
    
    // Handle plain UTC
    if (tz === 'UTC') return 'UTC+0';
    
    // Fallback: return as-is
    return tz;
  };

  const utcOffset = getUTCOffset(timezone || 'UTC');

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
        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.5rem" }}>
          ({utcOffset})
        </span>
      )}
    </span>
  );
}
