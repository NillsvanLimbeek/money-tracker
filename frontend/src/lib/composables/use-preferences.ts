import type { RemovableRef } from '@vueuse/core';
import { useLocalStorage } from '@vueuse/core';

// Device-local settings toggles. Not synced to the backend yet.
export function usePreferences(): { autoCategorise: RemovableRef<boolean>; suggestRule: RemovableRef<boolean> } {
  const autoCategorise = useLocalStorage('pref:auto-categorise', true);
  const suggestRule = useLocalStorage('pref:suggest-rule', true);

  return { autoCategorise, suggestRule };
}
