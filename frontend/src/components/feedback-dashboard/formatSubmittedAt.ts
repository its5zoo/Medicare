/**
 * Derive display date and time from submittedAt using Asia/Kolkata timezone.
 *
 * Date format: "23 Jun 2026"
 * Time format: "4:19 PM"
 */
import { humanizeRelativeTime } from '@/lib/humanizer';

export function formatSubmittedAt(submittedAt: string | null): {
  date: string;
  time: string;
  relative: string;
} {
  if (!submittedAt) return { date: '-', time: '-', relative: '-' };

  const parsed = new Date(submittedAt);
  if (isNaN(parsed.getTime())) return { date: '-', time: '-', relative: '-' };

  const date = parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const time = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const relative = humanizeRelativeTime(parsed);

  return { date, time, relative };
}

/**
 * Parse submittedAt into a midnight-normalised Date in Asia/Kolkata,
 * suitable for day-difference calculations.
 *
 * Returns null if submittedAt is missing or unparseable.
 */
export function parseSubmittedAtDate(submittedAt: string | null): Date | null {
  if (!submittedAt) return null;

  const parsed = new Date(submittedAt);
  if (isNaN(parsed.getTime())) return null;

  // Extract the calendar date in Asia/Kolkata
  const parts = parsed.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  // en-CA produces "YYYY-MM-DD"
  const [y, m, d] = parts.split('-').map(Number);
  return new Date(y, m - 1, d); // local midnight
}
