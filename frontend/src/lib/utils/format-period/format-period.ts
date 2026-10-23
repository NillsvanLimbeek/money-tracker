import { format, parseISO } from 'date-fns';

/**
 * Describes the months covered by a list of ISO dates. The year is only repeated when the period crosses a year boundary.
 *
 * @param dates - ISO dates in any order.
 * @returns A label such as `October 2026`, or an empty string when there are no dates.
 * @example
 * formatPeriod(['2026-10-03', '2026-10-20']); // 'October 2026'
 * formatPeriod(['2026-09-28', '2026-10-02']); // 'September – October 2026'
 * formatPeriod(['2025-12-30', '2026-01-02']); // 'December 2025 – January 2026'
 */
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
