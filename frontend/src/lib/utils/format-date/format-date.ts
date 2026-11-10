import { format, parseISO } from 'date-fns';
import { usePreferences } from '@/lib/composables/use-preferences';

const { dateFormat } = usePreferences();

/**
 * Formats an ISO date for display using the date format preference (`dd-MM-yyyy` by default).
 *
 * @param isoDate - A date in ISO format, e.g. `2026-10-03`.
 * @returns The formatted date.
 * @example
 * formatDate('2026-10-03'); // '03-10-2026'
 */
export function formatDate(isoDate: string): string {
  return format(parseISO(isoDate), dateFormat.value);
}
