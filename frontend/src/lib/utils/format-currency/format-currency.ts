import type { NumberFormat } from '@/lib/composables/use-preferences';
import { usePreferences } from '@/lib/composables/use-preferences';

const NUMBER_LOCALES: Record<NumberFormat, string> = { nl: 'nl-NL', en: 'en-US' };

const FORMATTERS = Object.fromEntries(
  Object.entries(NUMBER_LOCALES).map(([key, locale]) => [
    key,
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]),
) as Record<NumberFormat, Intl.NumberFormat>;

const { numberFormat } = usePreferences();

/**
 * Formats an amount as signed euros, always with two decimals. Separators follow the number format preference (Dutch by default).
 *
 * @param value - The amount in euros. Negative values are expenses.
 * @returns The amount with a `+` or `−` sign, e.g. `−€1.234,50`.
 * @example
 * formatCurrency(-1234.5); // '−€1.234,50'
 * formatCurrency(12.5); // '+€12,50'
 */
export function formatCurrency(value: number): string {
  const sign = value < 0 ? '−' : '+';
  return `${sign}€${FORMATTERS[numberFormat.value].format(Math.abs(value))}`;
}
