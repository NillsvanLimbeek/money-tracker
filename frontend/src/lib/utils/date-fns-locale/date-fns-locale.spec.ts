import { enUS, nl } from 'date-fns/locale';
import { afterEach, describe, expect, it } from 'vitest';
import { overwriteGetLocale } from '@/paraglide/runtime';
import { dateFnsLocale, formatLocalised } from './date-fns-locale';

describe('dateFnsLocale', () => {
  afterEach(() => {
    overwriteGetLocale(() => 'en');
  });

  it('returns the English locale for en', () => {
    overwriteGetLocale(() => 'en');

    expect(dateFnsLocale()).toBe(enUS);
  });

  it('returns the Dutch locale for nl', () => {
    overwriteGetLocale(() => 'nl');

    expect(dateFnsLocale()).toBe(nl);
  });

  it('formats without the trailing dot of Dutch abbreviations', () => {
    overwriteGetLocale(() => 'nl');

    expect(formatLocalised(new Date(2026, 0, 5), 'EEE d MMM')).toBe('maa 5 jan');
  });

  it('formats English dates unchanged', () => {
    expect(formatLocalised(new Date(2026, 0, 5), 'EEE d MMM')).toBe('Mon 5 Jan');
  });
});
