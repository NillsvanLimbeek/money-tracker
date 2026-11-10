import { isToday } from 'date-fns';
import { formatLocalised } from '@/lib/utils/date-fns-locale/date-fns-locale';
import { isMonthFirst } from '@/lib/utils/format-date/format-date';
import { m } from '@/paraglide/messages';

/**
 * Labels a day for a transaction group header, in the active language. The day and month order follows the date format preference, and today gets a `Today ·` prefix.
 *
 * @param date - The day to label.
 * @returns The weekday, day and month, e.g. `Sat 3 Oct` (`Sat Oct 3` when the month comes first), or `Today · Sat 3 Oct` for today.
 * @example
 * dayLabel(new Date(2026, 9, 3)); // 'Sat 3 Oct'
 */
export function dayLabel(date: Date): string {
  const day = formatLocalised(date, isMonthFirst() ? 'EEE MMM d' : 'EEE d MMM');
  return isToday(date) ? m.day_today({ day }) : day;
}
