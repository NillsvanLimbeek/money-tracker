import { describe, expect, it } from 'vitest';
import { formatDate } from './format-date';

describe('formatDate', () => {
  it('formats an ISO date as dd-MM-yyyy', () => {
    expect(formatDate('2026-10-03')).toBe('03-10-2026');
  });
});
