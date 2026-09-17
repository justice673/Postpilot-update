/** Calendar / schedule helpers keyed to a user IANA timezone (e.g. Africa/Douala). */

export function resolveUserTimeZone(preferred?: string | null): string {
  if (preferred?.trim()) return preferred.trim();
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** YYYY-MM-DD for an instant in a given IANA timezone. */
export function zonedDateKey(date: Date | string, timeZone: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * YYYY-MM-DD for a calendar cell Date.
 * Cells are built as local midnights whose Y/M/D are the displayed day —
 * use those components, don't re-interpret the instant in another zone.
 */
export function calendarDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Today's calendar day in the user's timezone. */
export function todayKeyInZone(timeZone: string, now = new Date()): string {
  return zonedDateKey(now, timeZone);
}

export function isPastCalendarDay(
  day: Date,
  timeZone: string,
  now = new Date(),
): boolean {
  return calendarDateKey(day) < todayKeyInZone(timeZone, now);
}

export function isTodayCalendarDay(
  day: Date,
  timeZone: string,
  now = new Date(),
): boolean {
  return calendarDateKey(day) === todayKeyInZone(timeZone, now);
}

export function isSameCalendarDayInZone(
  instant: Date | string,
  day: Date,
  timeZone: string,
): boolean {
  return zonedDateKey(instant, timeZone) === calendarDateKey(day);
}
