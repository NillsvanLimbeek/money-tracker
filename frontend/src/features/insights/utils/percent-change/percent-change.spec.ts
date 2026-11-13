import { describe, expect, it } from 'vitest';
import { percentChange } from './percent-change';

describe('percentChange', () => {
  it('returns the rounded percentage change', () => {
    expect(percentChange(105, 100)).toBe(5);
    expect(percentChange(50, 100)).toBe(-50);
  });

  it('returns 0 when the previous value is 0', () => {
    expect(percentChange(100, 0)).toBe(0);
  });
});
