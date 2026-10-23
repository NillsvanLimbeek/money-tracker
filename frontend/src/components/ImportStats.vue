<script setup lang="ts">
import type { ImportRow } from '@/lib/types';
import { computed } from 'vue';

interface Props {
  rows: ImportRow[];
  selectedRows: ImportRow[];
  duplicateCount: number;
}

const { rows, selectedRows, duplicateCount } = defineProps<Props>();

const stats = computed(() => [
  { label: 'Found', value: rows.length, valueClass: 'text-highlighted' },
  { label: 'Selected', value: selectedRows.length, valueClass: 'text-primary' },
  { label: 'Duplicates', value: duplicateCount, valueClass: 'text-highlighted' },
]);
</script>

<template>
  <dl class="border-accented bg-default divide-accented grid grid-cols-3 divide-x rounded-2xl border shadow-sm">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col gap-1 p-3"
    >
      <dt class="text-muted font-mono text-xs tracking-wide uppercase">
        {{ stat.label }}
      </dt>

      <dd
        class="text-xl font-semibold"
        :class="stat.valueClass"
      >
        {{ stat.value }}
      </dd>
    </div>
  </dl>
</template>
