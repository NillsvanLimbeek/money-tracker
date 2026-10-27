<script setup lang="ts">
import type { ImportRow } from '@/lib/types';
import type { ParseError } from '@/lib/utils';
import { computed, ref } from 'vue';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency, groupRowsByMonth, importRowToTransaction } from '@/lib/utils';

interface Props {
  rows: ImportRow[];
  errors: ParseError[];
  duplicateHashes: string[];
  isSubmitting: boolean;
}

const { rows, errors, duplicateHashes } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'confirm', rows: ImportRow[]): void;
}>();

const duplicates = computed(() => new Set(duplicateHashes));
const isDuplicate = (row: ImportRow): boolean => duplicates.value.has(row.importHash);

const selected = ref(new Set(rows.filter(row => !isDuplicate(row)).map(row => row.importHash)));

const groups = computed(() => groupRowsByMonth(rows));
const selectedRows = computed(() => rows.filter(row => selected.value.has(row.importHash)));
const duplicateCount = computed(() => rows.filter(isDuplicate).length);

const stats = computed(() => [
  { label: 'Found', value: rows.length },
  { label: 'Selected', value: selectedRows.value.length, valueClass: 'text-primary' },
  { label: 'Duplicates', value: duplicateCount.value },
]);

const income = computed(() => selectedRows.value
  .filter(row => row.amountCents > 0)
  .reduce((sum, row) => sum + row.amountCents, 0) / 100);
const expense = computed(() => selectedRows.value
  .filter(row => row.amountCents < 0)
  .reduce((sum, row) => sum - row.amountCents, 0) / 100);

function toggle(row: ImportRow): void {
  if (isDuplicate(row))
    return;

  if (selected.value.has(row.importHash))
    selected.value.delete(row.importHash);
  else
    selected.value.add(row.importHash);
}

function selectable(groupRows: ImportRow[]): ImportRow[] {
  return groupRows.filter(row => !isDuplicate(row));
}

function allSelected(groupRows: ImportRow[]): boolean {
  const available = selectable(groupRows);
  return available.length > 0 && available.every(row => selected.value.has(row.importHash));
}

function toggleGroup(groupRows: ImportRow[]): void {
  const select = !allSelected(groupRows);

  for (const row of selectable(groupRows)) {
    if (select)
      selected.value.add(row.importHash);
    else
      selected.value.delete(row.importHash);
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col">
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <StatStrip :stats />

      <UAlert
        v-if="errors.length > 0"
        color="warning"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        :title="`${errors.length} ${errors.length === 1 ? 'row' : 'rows'} could not be read and will be skipped`"
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

      <section
        v-for="group in groups"
        :key="group.key"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center justify-between px-1">
          <h3 class="text-highlighted font-medium">
            {{ group.label }}
          </h3>

          <UButton
            variant="link"
            class="p-0"
            :disabled="selectable(group.rows).length === 0"
            @click="toggleGroup(group.rows)"
          >
            {{ allSelected(group.rows) ? 'Deselect all' : 'Select all' }}
          </UButton>
        </div>

        <div class="border-accented bg-default divide-accented divide-y overflow-hidden rounded-2xl border shadow-sm">
          <TransactionRow
            v-for="row in group.rows"
            :key="row.importHash"
            :transaction="importRowToTransaction(row)"
            :categories="CATEGORIES"
            selectable
            :selected="selected.has(row.importHash)"
            :duplicate="isDuplicate(row)"
            @toggle="toggle(row)"
          />
        </div>
      </section>
    </div>

    <div class="border-accented bg-olive-50 sticky bottom-0 flex flex-col items-center gap-3 border-t p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <UButton
        block
        size="xl"
        color="neutral"
        class="justify-center rounded-2xl py-4"
        :loading="isSubmitting"
        :disabled="selectedRows.length === 0"
        @click="emit('confirm', selectedRows)"
      >
        Import {{ selectedRows.length }} {{ selectedRows.length === 1 ? 'transaction' : 'transactions' }}
      </UButton>
      <span class="text-muted font-mono text-sm">{{ formatCurrency(income) }} in · {{ formatCurrency(-expense) }} out</span>
    </div>
  </div>
</template>
