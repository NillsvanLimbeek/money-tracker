<script setup lang="ts">
import type { ParseError } from '@/features/import/utils';
import type { CategoryRule, ImportRow } from '@/lib/types';
import { computed, ref } from 'vue';
import { groupRowsByMonth, importRowToTransaction } from '@/features/import/utils';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  rows: ImportRow[];
  errors: ParseError[];
  duplicateHashes: string[];
  // The user's rules, oldest first, used to show the category each row will get.
  rules?: CategoryRule[];
  isSubmitting: boolean;
}

const { rows, errors, duplicateHashes, rules = [] } = defineProps<Props>();
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
  { label: m.import_stat_found(), value: rows.length },
  { label: m.import_stat_selected(), value: selectedRows.value.length, valueClass: 'text-primary' },
  { label: m.import_stat_duplicates(), value: duplicateCount.value },
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
        :title="m.import_unreadable_rows({ count: errors.length })"
      >
        <template #description>
          <ul class="mt-1 flex flex-col gap-0.5">
            <li
              v-for="error in errors"
              :key="error.line"
            >
              {{ m.import_error_line({ line: error.line, message: error.message }) }}
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
            {{ allSelected(group.rows) ? m.import_deselect_all() : m.import_select_all() }}
          </UButton>
        </div>

        <div class="border-accented bg-default divide-accented divide-y overflow-hidden rounded-2xl border shadow-sm">
          <TransactionRow
            v-for="row in group.rows"
            :key="row.importHash"
            :transaction="importRowToTransaction(row, rules)"
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
        {{ m.import_confirm({ count: selectedRows.length }) }}
      </UButton>
      <span class="text-muted font-mono text-sm">{{ m.import_totals({ income: formatCurrency(income), expense: formatCurrency(-expense) }) }}</span>
    </div>
  </div>
</template>
