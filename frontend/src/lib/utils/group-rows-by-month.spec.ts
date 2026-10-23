import { describe, expect, it } from 'vitest';
import { groupRowsByMonth } from './group-rows-by-month';

describe('groupRowsByMonth', () => {
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
