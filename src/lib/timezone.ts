/**
 * Timezone utilities for server-side date operations.
 *
 * Vercel servers run in UTC. `new Date()` returns the current instant in UTC.
 * When it's 7 PM in Mexico City (UTC-6), Vercel might already be 1 AM the next day.
 *
 * This breaks "today's appointments" because `startOfDay(new Date())` uses
 * UTC day boundaries, not the business timezone's calendar.
 *
 * DB stores timestamps in UTC. To query "today", we need to find the UTC
 * timestamps that correspond to midnight in America/Mexico_City.
 */

const TZ = "America/Mexico_City";

function tzParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return m;
}

/**
 * UTC timestamp for midnight (00:00:00.000) in the business timezone.
 * Use as `gte` in Prisma queries for "today".
 * Handles DST automatically via Intl.
 */
export function startOfDayUTC(date: Date = new Date()): Date {
  const m = tzParts(date);
  return new Date(Date.UTC(+m.year, +m.month - 1, +m.day, 0, 0, 0, 0));
}

/**
 * UTC timestamp for 23:59:59.999 in the business timezone.
 * Use as `lte` in Prisma queries for "today".
 */
export function endOfDayUTC(date: Date = new Date()): Date {
  return new Date(startOfDayUTC(date).getTime() + 86399999);
}

/**
 * Subtract N days respecting the business timezone calendar.
 * Returns UTC midnight of that earlier business day.
 */
export function subDaysUTC(date: Date, days: number): Date {
  const s = startOfDayUTC(date);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() - days));
}

/**
 * Add N days respecting the business timezone calendar.
 * Returns UTC midnight of that future business day.
 */
export function addDaysUTC(date: Date, days: number): Date {
  const s = startOfDayUTC(date);
  return new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() + days));
}

/**
 * Format a UTC Date as YYYY-MM-DD in the business timezone.
 * Use for grouping/chart keys so they match the business calendar.
 */
export function formatInTZ(date: Date): string {
  const m = tzParts(date);
  return `${m.year}-${m.month}-${m.day}`;
}

/**
 * Format a UTC Date as a localized day name (e.g. "Lun", "Mar")
 * in the business timezone.
 */
export function formatDayName(date: Date): string {
  const name = new Intl.DateTimeFormat("es", { timeZone: TZ, weekday: "short" }).format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Parse a YYYY-MM-DD string as a calendar date in the business timezone,
 * returning the UTC timestamp for start of that day.
 *
 * Use when the client sends a date string from a calendar picker.
 * The string represents a date in the business timezone.
 *
 * Handles DST correctly via Intl.
 */
export function parseDateForTZ(dateStr: string): Date {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const candidate = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
  return startOfDayUTC(candidate);
}

/**
 * Get the day of week (0=Sunday, 6=Saturday) in the business timezone.
 * Same signature as date-fns getDay() but timezone-aware.
 */
export function getDayOfWeek(date: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).formatToParts(date);

  const dayName = parts.find(p => p.type === "weekday")!.value;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(dayName);
}

/**
 * Current moment as a Date reflecting the business timezone.
 * Use instead of `new Date()` for comparisons like "is this slot in the past?"
 */
export function nowInTZ(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;

  return new Date(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second);
}
