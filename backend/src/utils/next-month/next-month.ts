export function nextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number);

  return m === 12
    ? `${year + 1}-01`
    : `${year}-${String(m + 1).padStart(2, '0')}`;
}
