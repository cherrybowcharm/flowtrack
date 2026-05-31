/**
 * Converts a total number of seconds into a human-readable string.
 * e.g. 3661 → "1h 1m 1s"
 */
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "0s";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Calculate duration in seconds between two Date objects.
 */
function calcDurationSeconds(startTime, endTime) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  return Math.floor((end - start) / 1000);
}

/**
 * Get the start (00:00:00.000) and end (23:59:59.999) of a given date.
 * @param {Date} date
 */
function getDayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get the Monday–Sunday bounds of the week containing `date`.
 */
function getWeekBounds(date = new Date()) {
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = (day === 0 ? -6 : 1 - day);

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Returns an ISO date string (YYYY-MM-DD) for a given Date object.
 */
function toDateString(date) {
  return new Date(date).toISOString().split("T")[0];
}

module.exports = {
  formatDuration,
  calcDurationSeconds,
  getDayBounds,
  getWeekBounds,
  toDateString,
};
