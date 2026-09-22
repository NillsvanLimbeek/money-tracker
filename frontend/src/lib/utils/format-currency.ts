const CURRENCY_FORMATTER = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  const sign = value < 0 ? '−' : '+';
  return `${sign}€${CURRENCY_FORMATTER.format(Math.abs(value))}`;
}
