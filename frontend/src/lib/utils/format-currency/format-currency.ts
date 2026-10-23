const CURRENCY_FORMATTER = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats an amount as signed euros using Dutch number formatting, always with two decimals.
 *
 * @param value - The amount in euros. Negative values are expenses.
 * @returns The amount with a `+` or `−` sign, e.g. `−€1.234,50`.
 * @example
 * formatCurrency(-1234.5); // '−€1.234,50'
 * formatCurrency(12.5); // '+€12,50'
 */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '−' : '+';
  return `${sign}€${CURRENCY_FORMATTER.format(Math.abs(value))}`;
}
