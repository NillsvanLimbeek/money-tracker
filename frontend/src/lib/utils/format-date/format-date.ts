import { format, parseISO } from 'date-fns';

/**
 * Formats an ISO date for display.
 *
 * @param isoDate - A date in ISO format, e.g. `2026-10-03`.
 * @returns The date as `dd-MM-yyyy`.
 * @example
 * formatDate('2026-10-03'); // '03-10-2026'
 */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), 'dd-MM-yyyy');
}
