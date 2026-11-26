"use client";

import { formatStoredTime, formatToLocalTime } from "@/lib/timezone";
import { getTimezoneOffset } from "date-fns-tz";

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

  // Calculate UTC offset for the specific date
  const getUTCOffset = (tz: string, dateTime: string) => {
    try {
      const date = new Date(dateTime);
      const offset = getTimezoneOffset(tz, date);
      // offset is in milliseconds, negative for zones ahead of UTC
      const hours = Math.floor(Math.abs(offset) / (1000 * 60 * 60));
      const minutes = Math.floor((Math.abs(offset) % (1000 * 60 * 60)) / (1000 * 60));
      const sign = offset < 0 ? '+' : '-'; // Negative offset means ahead of UTC (positive offset display)
      return minutes > 0 ? `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}` : `UTC${sign}${hours}`;
    } catch (error) {
      return 'UTC+0';
    }
  };

  const utcOffset = timezone ? getUTCOffset(timezone, interviewTime) : 'UTC+0';

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
