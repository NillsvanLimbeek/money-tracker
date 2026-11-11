import { format, parseISO } from 'date-fns';
import { dateFnsLocale } from '@/lib/utils/date-fns-locale/date-fns-locale';

export interface MonthGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

/**
 * Groups ISO-dated rows by calendar month, newest month first. Row order within a month is kept.
 *
 * @param rows - Rows with an ISO `date`.
 * @returns One group per month, keyed by `yyyy-MM` and labelled like `October 2026`.
 * @example
 * groupRowsByMonth([{ date: '2026-09-30' }, { date: '2026-10-01' }]);
 * // [{ key: '2026-10', label: 'October 2026', rows: [...] }, { key: '2026-09', label: 'September 2026', rows: [...] }]
 */
export function groupRowsByMonth<T extends { date: string }>(rows: T[]): MonthGroup<T>[] {
  const groups = new Map<string, MonthGroup<T>>();

  for (const row of rows) {
    const key = row.date.slice(0, 7);
    let group = groups.get(key);

    if (!group) {
      group = { key, label: format(parseISO(row.date), 'MMMM yyyy', { locale: dateFnsLocale() }), rows: [] };
      groups.set(key, group);
    }

    group.rows.push(row);
  }

  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}
