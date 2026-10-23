<script setup lang="ts">
import type { ImportSummary } from '@/lib/api/transactions/transactions.api';
import type { ImportRow } from '@/lib/types';
import { computed } from 'vue';
import { formatCurrency, formatPeriod } from '@/lib/utils';

interface Props {
  summary: ImportSummary;
  // The rows that were sent to the import route.
  rows: ImportRow[];
  fileName: string;
}

const { summary, rows, fileName } = defineProps<Props>();
const emit = defineEmits<{ (e: 'reset'): void }>();

const income = computed(() => rows
  .filter(row => row.amountCents > 0)
  .reduce((sum, row) => sum + row.amountCents, 0) / 100);
const expense = computed(() => rows
  .filter(row => row.amountCents < 0)
  .reduce((sum, row) => sum - row.amountCents, 0) / 100);

// Until keyword categorisation lands every debit is stored as "Other".
const uncategorised = computed(() => rows.filter(row => row.amountCents < 0).length);

const period = computed(() => formatPeriod(rows.map(row => row.date)));

const stats = computed(() => [
  { label: 'In', value: formatCurrency(income.value), valueClass: 'text-primary' },
  { label: 'Out', value: formatCurrency(-expense.value) },
  { label: 'Skipped', value: summary.skipped },
]);
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-col gap-6 p-4">
      <div class="flex flex-col items-center gap-4 pt-12 text-center">
        <div class="bg-primary/10 flex size-20 items-center justify-center rounded-full">
          <UIcon
            name="i-lucide-check"
            class="text-primary size-8"
          />
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="text-highlighted text-2xl font-bold">
            {{ summary.imported }} {{ summary.imported === 1 ? 'transaction' : 'transactions' }} imported
          </h2>

          <p class="text-muted">
            Added from {{ fileName }} to {{ period }}.
          </p>
        </div>
      </div>

      <StatStrip :stats />

      <RouterLink
        v-if="uncategorised > 0"
        to="/"
        class="border-accented bg-default flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm"
      >
        <span class="border-accented bg-elevated text-muted rounded-full border border-dashed px-3 py-1 text-xs font-medium">
          Uncategorised
        </span>

        <span class="text-muted flex-1">
          {{ uncategorised }} {{ uncategorised === 1 ? 'needs' : 'need' }} a category
        </span>

        <UIcon
          name="i-lucide-chevron-right"
          class="text-muted size-4"
        />
      </RouterLink>
    </div>

    <div class="border-accented bg-olive-50 sticky bottom-0 flex flex-col items-center gap-3 border-t p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <UButton
        to="/"
        block
        size="xl"
        color="neutral"
        class="justify-center rounded-2xl py-4"
      >
        View transactions
      </UButton>

      <UButton
        variant="link"
        @click="emit('reset')"
      >
        Import another file
      </UButton>
    </div>
  </div>
</template>
