<script setup lang="ts">
import type { ImportRow } from '@/lib/types';
import type { ParseError } from '@/lib/utils';
import { computed } from 'vue';
import CurrencyAmount from '@/components/CurrencyAmount.vue';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  rows: ImportRow[];
  errors: ParseError[];
  isSubmitting: boolean;
}

const { rows, errors } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

// Rows come newest first, but don't rely on it for the range.
const dateRange = computed(() => {
  const dates = rows.map(row => row.date).sort();
  return dates.length > 0 ? `${formatDate(dates[0]!)} – ${formatDate(dates.at(-1)!)}` : '';
});

const income = computed(() => rows
  .filter(row => row.amountCents > 0)
  .reduce((sum, row) => sum + row.amountCents, 0) / 100);
const expense = computed(() => rows
  .filter(row => row.amountCents < 0)
  .reduce((sum, row) => sum - row.amountCents, 0) / 100);
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <div class="border-accented bg-default flex flex-col gap-4 rounded-2xl border p-4 shadow-sm">
      <div class="flex flex-col gap-1">
        <span class="text-highlighted font-semibold">{{ rows.length }} transactions ready to import</span>
        <span
          v-if="dateRange"
          class="text-muted font-mono text-xs"
        >{{ dateRange }}</span>
      </div>

      <div class="flex justify-between">
        <CurrencyAmount
          label="Income"
          :value="income"
          class="text-primary"
        />
        <CurrencyAmount
          label="Expenses"
          :value="-expense"
          class="text-highlighted"
          align="end"
        />
      </div>

      <div class="flex gap-3">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="flex-1 justify-center"
          :disabled="isSubmitting"
          @click="emit('cancel')"
        >
          Cancel
        </UButton>
        <UButton
          size="lg"
          class="flex-1 justify-center"
          :loading="isSubmitting"
          :disabled="rows.length === 0"
          @click="emit('confirm')"
        >
          Import
        </UButton>
      </div>
    </div>

    <UAlert
      v-if="errors.length > 0"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      :title="`${errors.length} ${errors.length === 1 ? 'row' : 'rows'} will be skipped`"
    >
      <template #description>
        <ul class="mt-1 flex flex-col gap-0.5">
          <li
            v-for="error in errors"
            :key="error.line"
          >
            Line {{ error.line }}: {{ error.message }}
          </li>
        </ul>
      </template>
    </UAlert>

    <div class="border-accented bg-default divide-accented divide-y rounded-2xl border shadow-sm">
      <div
        v-for="row in rows"
        :key="row.importHash"
        class="flex items-start gap-3 px-4 py-3"
      >
        <span class="text-muted w-20 shrink-0 pt-0.5 font-mono text-xs">{{ formatDate(row.date) }}</span>
        <span class="text-highlighted min-w-0 flex-1 truncate text-sm font-medium">{{ row.description }}</span>
        <span
          class="shrink-0 text-sm font-bold"
          :class="row.amountCents > 0 ? 'text-primary' : 'text-highlighted'"
        >{{ formatCurrency(row.amountCents / 100) }}</span>
      </div>
    </div>
  </div>
</template>
