import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useDateStore } from './date';

describe('useDateStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts on the first day of the current month', () => {
    const now = new Date();

    expect(useDateStore().selectedMonth).toEqual(new Date(now.getFullYear(), now.getMonth(), 1));
  });

  it('exposes the selected month as YYYY-MM', () => {
    const store = useDateStore();

    store.selectedMonth = new Date(2026, 9, 1);

    expect(store.monthKey).toBe('2026-10');
  });
});
