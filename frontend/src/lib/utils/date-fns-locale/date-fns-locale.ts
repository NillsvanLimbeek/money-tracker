import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { enUS, nl } from 'date-fns/locale';
import { getLocale } from '@/paraglide/runtime';

const DATE_FNS_LOCALES: Record<ReturnType<typeof getLocale>, Locale> = { en: enUS, nl };

/**
 * The date-fns locale matching the active app language, for month and weekday names.
 *
 * @returns `enUS` or `nl`.
 * @example
 * format(new Date(2026, 0, 5), 'EEE d MMM', { locale: dateFnsLocale() }); // 'maa 5 jan' in Dutch
 */
export function dateFnsLocale(): Locale {
  return DATE_FNS_LOCALES[getLocale()];
}

/**
 * Formats a date with the active locale's month and weekday names, without the trailing dot Dutch abbreviations carry.
 *
 * @param date - The date to format.
 * @param pattern - A date-fns pattern, e.g. `EEE d MMM`.
 * @returns The localised text, e.g. `maa 5 jan` rather than `maa 5 jan.`.
 * @example
 * formatLocalised(new Date(2026, 0, 5), 'EEE d MMM'); // 'maa 5 jan' in Dutch, 'Mon 5 Jan' in English
 */
export function formatLocalised(date: Date, pattern: string): string {
  return format(date, pattern, { locale: dateFnsLocale() }).replace(/\.$/, '');
}
