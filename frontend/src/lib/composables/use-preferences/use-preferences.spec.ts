import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createStorage } from '@/test/create-storage';

// The refs are created when the module loads, so each test stubs storage first and imports a fresh copy.
async function loadPreferences(stored: Record<string, string> = {}): Promise<{ preferences: ReturnType<typeof import('./use-preferences').usePreferences>; storage: Storage }> {
  const storage = createStorage(stored);
  vi.stubGlobal('localStorage', storage);
  vi.resetModules();

  const { usePreferences } = await import('./use-preferences');

  return { preferences: usePreferences(), storage };
}

describe('usePreferences', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to auto-categorise and suggest-rule on, Dutch number format and dd-MM-yyyy dates', async () => {
    const { preferences } = await loadPreferences();

    expect(preferences.autoCategorise.value).toBe(true);
    expect(preferences.suggestRule.value).toBe(true);
    expect(preferences.numberFormat.value).toBe('nl');
    expect(preferences.dateFormat.value).toBe('dd-MM-yyyy');
  });

  it('restores previously saved preferences', async () => {
    const { preferences } = await loadPreferences({
      'pref:auto-categorise': 'false',
      'pref:suggest-rule': 'false',
      'pref:number-format': 'en',
      'pref:date-format': 'MM-dd-yyyy',
    });

    expect(preferences.autoCategorise.value).toBe(false);
    expect(preferences.suggestRule.value).toBe(false);
    expect(preferences.numberFormat.value).toBe('en');
    expect(preferences.dateFormat.value).toBe('MM-dd-yyyy');
  });

  it('saves a change to local storage', async () => {
    const { preferences, storage } = await loadPreferences();

    preferences.autoCategorise.value = false;
    preferences.numberFormat.value = 'en';
    preferences.dateFormat.value = 'MM-dd-yyyy';
    await nextTick();

    expect(storage.getItem('pref:auto-categorise')).toBe('false');
    expect(storage.getItem('pref:number-format')).toBe('en');
    expect(storage.getItem('pref:date-format')).toBe('MM-dd-yyyy');
  });

  it('shares the same refs between callers', async () => {
    await loadPreferences();
    const { usePreferences } = await import('./use-preferences');

    usePreferences().suggestRule.value = false;

    expect(usePreferences().suggestRule.value).toBe(false);
  });
});
