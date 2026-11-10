import type { RemovableRef } from '@vueuse/core';
import type { DateFormat, NumberFormat } from '../types';
import { useLocalStorage } from '@vueuse/core';

// Shared module-level refs so plain formatting helpers react to a change on the Settings page.
const autoCategorise = useLocalStorage('pref:auto-categorise', true);
const suggestRule = useLocalStorage('pref:suggest-rule', true);
const numberFormat = useLocalStorage<NumberFormat>('pref:number-format', 'nl');
const dateFormat = useLocalStorage<DateFormat>('pref:date-format', 'dd-MM-yyyy');

// Device-local settings. Not synced to the backend yet.
export function usePreferences(): {
  autoCategorise: RemovableRef<boolean>;
  suggestRule: RemovableRef<boolean>;
  numberFormat: RemovableRef<NumberFormat>;
  dateFormat: RemovableRef<DateFormat>;
} {
  return { autoCategorise, suggestRule, numberFormat, dateFormat };
}
