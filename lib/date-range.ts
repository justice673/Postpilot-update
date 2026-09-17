import { differenceInCalendarDays, format, parse, startOfDay, endOfDay } from "date-fns";

export interface DateRangeValue {
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: string | undefined | null): value is string {
  if (!value || !DATE_RE.test(value)) return false;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return !Number.isNaN(parsed.getTime());
}

/** Parse `from` / `to` query params into a normalized inclusive range. */
export function parseDateRangeParams(params: {
  from?: string | string[];
  to?: string | string[];
}): DateRangeValue | null {
  const rawFrom = Array.isArray(params.from) ? params.from[0] : params.from;
  const rawTo = Array.isArray(params.to) ? params.to[0] : params.to;

  if (!isValidDateString(rawFrom) && !isValidDateString(rawTo)) {
    return null;
  }

  let from = isValidDateString(rawFrom) ? rawFrom : rawTo!;
  let to = isValidDateString(rawTo) ? rawTo : rawFrom!;

  if (from > to) {
    [from, to] = [to, from];
  }

  return { from, to };
}

export function dateRangeStart(range: DateRangeValue): Date {
  return startOfDay(parse(range.from, "yyyy-MM-dd", new Date()));
}

export function dateRangeEnd(range: DateRangeValue): Date {
  return endOfDay(parse(range.to, "yyyy-MM-dd", new Date()));
}

export function isDateInRange(date: Date, range: DateRangeValue): boolean {
  return date >= dateRangeStart(range) && date <= dateRangeEnd(range);
}

/** Inclusive calendar-day check against an ISO timestamp (server-safe). */
export function isIsoInRange(iso: string, from: string, to: string) {
  const day = iso.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function formatDateRangeLabel(range: DateRangeValue): string {
  const from = parse(range.from, "yyyy-MM-dd", new Date());
  const to = parse(range.to, "yyyy-MM-dd", new Date());
  if (range.from === range.to) {
    return format(from, "MMM d, yyyy");
  }
  return `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
}

export function daysInRange(range: DateRangeValue): number {
  return (
    differenceInCalendarDays(
      parse(range.to, "yyyy-MM-dd", new Date()),
      parse(range.from, "yyyy-MM-dd", new Date()),
    ) + 1
  );
}
