import { describe, expect, it } from 'vitest';
import { nextMonth } from './next-month';

describe('nextMonth', () => {
  it('increments the month and zero-pads it', () => {
    expect(nextMonth('2026-01')).toBe('2026-02');
    expect(nextMonth('2026-09')).toBe('2026-10');
  });

  it('rolls December over into January of the next year', () => {
    expect(nextMonth('2026-12')).toBe('2027-01');
  });
});
