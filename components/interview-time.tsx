"use client";

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
  format: formatStr = "yyyy-MM-dd HH:mm",
  showTimezone = false,
  style = {}
}: InterviewTimeProps) {
  // Extract datetime parts directly from the string without Date conversion
  const formatDateTime = (dateStr: string) => {
    // Expected format from DB: "2026-11-30T01:30:00.000Z" or similar
    const date = dateStr.substring(0, 10); // YYYY-MM-DD
    const time = dateStr.substring(11, 16); // HH:mm
    return `${date} ${time}`;
  };

  const formattedTime = formatDateTime(interviewTime);

  // Extract UTC offset from Etc/GMT format for display
  const getUTCOffset = (tz?: string) => {
    if (!tz) return '';
    
    if (tz === 'Asia/Kolkata') return 'UTC+5:30';
    
    if (tz.startsWith('Etc/GMT')) {
      const match = tz.match(/Etc\/GMT([+-]?\d+)/);
      if (match) {
        const offset = match[1];
        if (offset.startsWith('+')) {
          return `UTC-${offset.substring(1)}`;
        } else if (offset.startsWith('-')) {
          return `UTC+${offset.substring(1)}`;
        } else {
          return `UTC+${offset}`;
        }
      }
    }
    
    if (tz === 'UTC') return 'UTC+0';
    
    return '';
  };

  const utcOffset = getUTCOffset(timezone);

  return (
    <span style={style}>
      {formattedTime}
      {showTimezone && utcOffset && (
        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "0.5rem" }}>
          ({utcOffset})
        </span>
      )}
    </span>
  );
}
