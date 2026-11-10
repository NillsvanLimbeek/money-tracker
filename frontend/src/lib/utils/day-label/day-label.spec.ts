import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePreferences } from '@/lib/composables';
import { overwriteGetLocale } from '@/paraglide/runtime';
import { dayLabel } from './day-label';

describe('dayLabel', () => {
  afterEach(() => {
    overwriteGetLocale(() => 'en');
    usePreferences().dateFormat.value = 'dd-MM-yyyy';
    vi.useRealTimers();
  });

  it('formats a past day as EEE d MMM', () => {
    expect(dayLabel(new Date(2020, 0, 5))).toBe('Sun 5 Jan');
  });

  it('puts the month first when the date format preference does', () => {
    usePreferences().dateFormat.value = 'MM-dd-yyyy';

    expect(dayLabel(new Date(2020, 0, 5))).toBe('Sun Jan 5');
  });

  it('prefixes today with the today label', () => {
    vi.useFakeTimers({ now: new Date(2026, 9, 3, 12) });

    expect(dayLabel(new Date(2026, 9, 3, 8))).toBe('Today · Sat 3 Oct');
  });

  it('uses Dutch names without a trailing dot when the locale is nl', () => {
    overwriteGetLocale(() => 'nl');

    expect(dayLabel(new Date(2020, 0, 5))).toBe('zon 5 jan');
  });
});
