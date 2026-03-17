/**
 * Unified timestamp handling for Firestore timestamps.
 * Use these helpers instead of manually accessing .seconds or .toDate()
 */

/**
 * Convert a Firestore timestamp (or Date) to a JS Date object.
 * Handles: Firestore Timestamp, plain Date, date string, null/undefined.
 */
export function toDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'string' || typeof timestamp === 'number') return new Date(timestamp);
  return null;
}

/**
 * Get epoch seconds for sorting/comparison.
 */
export function toSeconds(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp.seconds === 'number') return timestamp.seconds;
  const d = toDate(timestamp);
  return d ? Math.floor(d.getTime() / 1000) : 0;
}

/**
 * Format a Firestore timestamp to Thai locale date string.
 */
export function formatDateTH(timestamp, options) {
  const d = toDate(timestamp);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', options);
}

/**
 * Format a Firestore timestamp to ISO date string (YYYY-MM-DD).
 */
export function formatDateISO(timestamp) {
  const d = toDate(timestamp);
  if (!d) return '';
  return d.toISOString().split('T')[0];
}
