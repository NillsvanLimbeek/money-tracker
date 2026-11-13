import type { NumberFormat } from '@/lib/types';
import { usePreferences } from '@/lib/composables';

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

/**
 * Formats an amount as unsigned euros, for totals where the direction is clear from context. Separators follow the number format preference.
 *
 * @param value - The amount in euros. The sign is dropped.
 * @param fractionDigits - How many decimals to show, `2` by default.
 * @returns The amount with a euro sign, e.g. `€1.234,50`.
 * @example
 * formatEuros(-1234.5); // '€1.234,50'
 * formatEuros(1909, 0); // '€1.909'
 */
export function formatEuros(value: number, fractionDigits = 2): string {
  const formatter = new Intl.NumberFormat(NUMBER_LOCALES[numberFormat.value], {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return `€${formatter.format(Math.abs(value))}`;
}
