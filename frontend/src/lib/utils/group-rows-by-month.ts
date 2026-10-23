import { format, parseISO } from 'date-fns';

export interface MonthGroup<T> {
  key: string;
  label: string;
  rows: T[];
}

// Groups ISO-dated rows by calendar month, newest month first. Row order within a month is kept.
export function groupRowsByMonth<T extends { date: string }>(rows: T[]): MonthGroup<T>[] {
  const groups = new Map<string, MonthGroup<T>>();

  for (const row of rows) {
    const key = row.date.slice(0, 7);
    let group = groups.get(key);

    if (!group) {
      group = { key, label: format(parseISO(row.date), 'MMMM yyyy'), rows: [] };
      groups.set(key, group);
    }

    group.rows.push(row);
  }

  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}
