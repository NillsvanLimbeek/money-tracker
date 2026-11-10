import { afterEach, describe, expect, it } from 'vitest';
import { usePreferences } from '@/lib/composables/use-preferences';
import { formatCurrency } from './format-currency';

describe('formatCurrency', () => {
  afterEach(() => {
    usePreferences().numberFormat.value = 'nl';
  });

  it('prefixes positive amounts with a plus', () => {
    expect(formatCurrency(12.5)).toBe('+€12,50');
  });

  it('prefixes negative amounts with a minus sign', () => {
    expect(formatCurrency(-12.5)).toBe('−€12,50');
  });

  it('groups thousands the Dutch way', () => {
    expect(formatCurrency(-1234.5)).toBe('−€1.234,50');
  });

  it('always shows two decimals', () => {
    expect(formatCurrency(3)).toBe('+€3,00');
  });

  it('uses English separators when the number format preference is en', () => {
    usePreferences().numberFormat.value = 'en';

    expect(formatCurrency(-1234.5)).toBe('−€1,234.50');
  });
});
