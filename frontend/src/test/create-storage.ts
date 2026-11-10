/**
 * An in-memory `Storage`, because the test environment's own `localStorage` is unusable (Node's `--localstorage-file` flag replaces it).
 *
 * @param initial - Entries to start with.
 * @returns A working `Storage`.
 * @example
 * vi.stubGlobal('localStorage', createStorage({ 'pref:number-format': 'en' }));
 */
export function createStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: key => data.get(key) ?? null,
    key: index => [...data.keys()][index] ?? null,
    removeItem: key => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}
