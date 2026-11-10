import type { DateFormat } from '../composables/use-preferences';

export const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string }[] = [
  { value: 'dd-MM-yyyy', label: 'DD-MM-YYYY' },
  { value: 'MM-dd-yyyy', label: 'MM-DD-YYYY' },
];
