<script setup lang="ts">
import type { ImportRow } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { computed } from 'vue';
import CategoryBadge from '@/components/CategoryBadge.vue';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface Props {
  row: ImportRow;
  selected: boolean;
  duplicate: boolean;
}

const { row, selected, duplicate } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const date = computed(() => parseISO(row.date));

// Mirrors the placeholder the import route stores until keyword categorisation lands.
const category = computed(() => {
  const key = row.amountCents > 0 ? 'income' : 'other';
  return CATEGORIES.find(category => category.key === key)!;
});
</script>

<template>
  <div
    class="flex w-full items-start gap-3 px-4 py-4 text-left"
    :class="duplicate ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'"
    @click="!duplicate && emit('toggle')"
  >
    <UCheckbox
      :model-value="selected"
      :disabled="duplicate"
      :aria-label="row.description"
      size="lg"
      class="mt-0.5"
      @click.stop
      @update:model-value="emit('toggle')"
    />

    <div class="text-muted flex w-9 shrink-0 flex-col items-start pt-0.5 font-mono text-xs leading-tight uppercase">
      <p>{{ format(date, 'dd') }}</p>
      <p>{{ format(date, 'MMM') }}</p>
    </div>

    <div class="flex min-w-0 flex-1 flex-col items-start gap-2">
      <p
        class="truncate font-semibold"
        :class="duplicate ? 'text-muted' : 'text-highlighted'"
      >
        {{ row.description }}
      </p>

      <p
        v-if="duplicate"
        class="border-accented text-muted rounded-full border border-dashed px-3 py-1 text-xs"
      >
        Already imported
      </p>

      <CategoryBadge
        v-else
        :category-key="category.key"
        :label="category.label"
        :show-icon="false"
        :interactive="false"
      />
    </div>

    <p
      class="shrink-0 font-bold"
      :class="row.amountCents > 0 && !duplicate ? 'text-primary' : duplicate ? 'text-muted' : 'text-highlighted'"
    >
      {{ formatCurrency(row.amountCents / 100) }}
    </p>
  </div>
</template>
