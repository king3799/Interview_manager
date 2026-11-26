"use client";

import { formatInTimeZone } from "date-fns-tz";

interface InterviewTimeProps {
  interviewTime: string;
  timezone?: string;
  format?: string;
  showTimezone?: boolean;
  style?: React.CSSProperties;
}

export function InterviewTime({ 
  interviewTime, 
  timezone = "UTC", 
  format = "yyyy-MM-dd HH:mm",
  showTimezone = false,
  style = {}
}: InterviewTimeProps) {
  // Ensure the datetime string is parsed as UTC
  const ensureUTC = (dateStr: string) => {
    // If it already has timezone info (Z or +/-), use as is
    if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // If no timezone info, assume UTC and add Z
    return dateStr.replace(' ', 'T') + 'Z';
  };

  const utcDateStr = ensureUTC(interviewTime);
  const date = new Date(utcDateStr);
  
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format time in the stored timezone
  const storedTime = formatInTimeZone(date, timezone, format);
  
  // Format time in browser's local timezone (for tooltip) - this is the key fix
  const localTime = date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: browserTimezone
  }).replace(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+)/, '$3-$1-$2 $4:$5');

  // Extract UTC offset from Etc/GMT format
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

  const utcOffset = getUTCOffset(timezone);

  return (
    <span 
      title={`Local time (${browserTimezone}): ${localTime}`}
      style={{ 
        cursor: "help",
        ...style
      }}
    >
      {storedTime}
      {showTimezone && (
        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.5rem" }}>
          ({utcOffset})
        </span>
      )}
    </span>
  );
}
