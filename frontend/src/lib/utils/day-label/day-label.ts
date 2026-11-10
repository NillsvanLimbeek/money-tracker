import { isToday } from 'date-fns';
import { formatLocalised } from '@/lib/utils/date-fns-locale/date-fns-locale';
import { m } from '@/paraglide/messages';

/**
 * Labels a day for a transaction group header, in the active language. Today gets a `Today ·` prefix.
 *
 * @param date - The day to label.
 * @returns The weekday, day and month, e.g. `Sat 3 Oct`, or `Today · Sat 3 Oct` for today.
 * @example
 * dayLabel(new Date(2026, 9, 3)); // 'Sat 3 Oct'
 */
export function dayLabel(date: Date): string {
  const day = formatLocalised(date, 'EEE d MMM');
  return isToday(date) ? m.day_today({ day }) : day;
}
