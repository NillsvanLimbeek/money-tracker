import { describe, expect, it } from 'vitest';
import { formatPercent } from './format-percent';

describe('formatPercent', () => {
  it('prefixes an increase with a plus', () => {
    expect(formatPercent(34)).toBe('+34%');
  });

  it('prefixes a decrease with a minus sign', () => {
    expect(formatPercent(-12)).toBe('−12%');
  });

  it('shows no sign for zero', () => {
    expect(formatPercent(0)).toBe('0%');
  });
});
