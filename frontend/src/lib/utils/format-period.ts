import { format, parseISO } from 'date-fns';

// Describes the months covered by ISO dates: "October 2026", "September – October 2026" or "December 2025 – January 2026".
export function formatPeriod(dates: string[]): string {
  if (dates.length === 0)
    return '';

  const sorted = [...dates].sort();
  const first = parseISO(sorted[0]!);
  const last = parseISO(sorted.at(-1)!);

  if (format(first, 'yyyy-MM') === format(last, 'yyyy-MM'))
    return format(first, 'MMMM yyyy');

  if (first.getFullYear() === last.getFullYear())
    return `${format(first, 'MMMM')} – ${format(last, 'MMMM yyyy')}`;

  return `${format(first, 'MMMM yyyy')} – ${format(last, 'MMMM yyyy')}`;
}
