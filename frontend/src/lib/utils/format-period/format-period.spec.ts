import { describe, expect, it } from 'vitest';
import { formatPeriod } from './format-period';

describe('formatPeriod', () => {
  it('names a single month', () => {
    expect(formatPeriod(['2026-10-18', '2026-10-02'])).toBe('October 2026');
  });

  it('spans months within a year', () => {
    expect(formatPeriod(['2026-10-01', '2026-09-30'])).toBe('September – October 2026');
  });

  it('spans years', () => {
    expect(formatPeriod(['2026-01-05', '2025-12-28'])).toBe('December 2025 – January 2026');
  });

  it('returns an empty string without dates', () => {
    expect(formatPeriod([])).toBe('');
  });
});
