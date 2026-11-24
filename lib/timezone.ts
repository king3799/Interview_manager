import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatToLocalTime(
  utcDate: Date | string,
  timeZone?: string,
  formatStr: string = "yyyy-MM-dd HH:mm"
): string {
  const tz = timeZone || getBrowserTimeZone();
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
  return formatInTimeZone(date, tz, formatStr);
}

export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}
