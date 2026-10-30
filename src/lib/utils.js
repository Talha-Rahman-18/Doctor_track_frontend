
// Minimal class-name joiner (kept local to avoid an extra dependency).
export function cn(...parts) {
  return parts
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value ?? 0);

export const pluralize = (count, singular, plural = `${singular}s`) => (count === 1 ? singular : plural);

export function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export const truncate = (text = "", max = 18) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** YYYY-MM-DD in UTC, offset by `days` from today. */
export function utcDate(daysFromToday = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

/** Drops empty values so they are not sent as `?search=&startDate=` (the API rejects empty dates). */
export function compactParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined));
}
