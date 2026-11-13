/**
 * Formats a whole-number percentage change with its sign.
 *
 * @param value - The change, positive or negative.
 * @returns The change with a `+` or `−` sign, or no sign for `0`.
 * @example
 * formatPercent(34); // '+34%'
 * formatPercent(-12); // '−12%'
 */
export function formatPercent(value: number): string {
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value)}%`;
}
