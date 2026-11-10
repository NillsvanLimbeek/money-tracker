import { afterEach, describe, expect, it } from 'vitest';
import { usePreferences } from '@/lib/composables/use-preferences';
import { formatDate, isMonthFirst } from './format-date';

describe('formatDate', () => {
  afterEach(() => {
    usePreferences().dateFormat.value = 'dd-MM-yyyy';
  });

  it('formats an ISO date as dd-MM-yyyy by default', () => {
    expect(formatDate('2026-10-03')).toBe('03-10-2026');
  });

  it('formats as MM-dd-yyyy when that preference is set', () => {
    usePreferences().dateFormat.value = 'MM-dd-yyyy';

    expect(formatDate('2026-10-03')).toBe('10-03-2026');
  });

  it('reports whether the month comes first', () => {
    expect(isMonthFirst()).toBe(false);

    usePreferences().dateFormat.value = 'MM-dd-yyyy';

    expect(isMonthFirst()).toBe(true);
  });
});
