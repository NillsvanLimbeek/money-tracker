import { afterEach, describe, expect, it } from 'vitest';
import { overwriteGetLocale } from '@/paraglide/runtime';
import { groupRowsByMonth } from './group-rows-by-month';

describe('groupRowsByMonth', () => {
  afterEach(() => {
    overwriteGetLocale(() => 'en');
  });

  it('labels months in Dutch when the locale is nl', () => {
    overwriteGetLocale(() => 'nl');

    expect(groupRowsByMonth([{ date: '2026-10-03' }])[0]!.label).toBe('oktober 2026');
  });

  it('groups by month, newest first, keeping row order', () => {
    const groups = groupRowsByMonth([
      { date: '2026-09-30', id: 'a' },
      { date: '2026-10-01', id: 'b' },
      { date: '2026-09-02', id: 'c' },
    ]);

    expect(groups.map(group => group.label)).toEqual(['October 2026', 'September 2026']);
    expect(groups[1]?.rows.map(row => row.id)).toEqual(['a', 'c']);
  });
});
