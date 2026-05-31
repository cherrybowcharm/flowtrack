/**
 * Format total seconds → "1h 23m 45s"
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0s";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

/**
 * Format seconds as HH:MM:SS — used for live timer display
 */
export function formatTimer(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * Get elapsed seconds since a given ISO startTime string
 */
export function getElapsedSeconds(startTime) {
  return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
}

/**
 * Format a Date to a readable time string: "10:45 AM"
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Format a Date to a short date string: "May 31"
 */
export function formatShortDate(date) {
  return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Format a Date to full date + time: "May 31, 2026 · 10:45 AM"
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString([], {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Format seconds as a compact label: 3661 → "1h 1m"
 */
export function formatDurationShort(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Is a date overdue? (before today, not completed)
 */
export function isOverdue(dueDate, status) {
  if (!dueDate || status === "COMPLETED") return false;
  return new Date(dueDate) < new Date();
}

/**
 * Is a date due today?
 */
export function isDueToday(dueDate) {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
