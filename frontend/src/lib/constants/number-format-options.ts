import type { NumberFormat } from '@/lib/types';

export const NUMBER_FORMAT_OPTIONS: { value: NumberFormat; label: string }[] = [
  { value: 'nl', label: '1.234,56' },
  { value: 'en', label: '1,234.56' },
];
