<script setup lang="ts">
import { formatCurrency } from '@/lib/utils';

defineOptions({ inheritAttrs: false });

const { label, value, align = 'start' } = defineProps<Props>();

interface Props {
  label: string;
  value: number;
  align?: 'start' | 'end';
}
</script>

<template>
  <div
    class="flex flex-col gap-1"
    :class="{ 'items-end': align === 'end', 'items-start': align !== 'end' }"
  >
    <span class="text-muted font-mono text-xs tracking-wide uppercase">{{ label }}</span>
    <span
      class="font-bold"
      v-bind="$attrs"
    >{{ formatCurrency(value) }}</span>
  </div>
</template>
