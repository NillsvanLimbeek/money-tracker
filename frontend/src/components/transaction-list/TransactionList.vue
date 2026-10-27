<script setup lang="ts">
import type { Category, Transaction } from '@/lib/types';
import { computed, ref } from 'vue';
import TransactionRow from '@/components/transaction-row/TransactionRow.vue';
import { formatCurrency, groupTransactionsByDay } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  categories: Category[];
}

const { transactions, categories } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'changeCategory', payload: { id: string; categoryKey: string }): void;
}>();

const groups = computed(() => groupTransactionsByDay(transactions));
const openRowId = ref<string | null>(null);

function toggleRow(id: string): void {
  openRowId.value = openRowId.value === id ? null : id;
}

function selectCategory(id: string, categoryKey: string): void {
  emit('changeCategory', { id, categoryKey });
  openRowId.value = null;
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <div
      v-for="group in groups"
      :key="group.key"
    >
      <div class="mb-2 flex items-center justify-between px-1">
        <span class="text-highlighted text-sm font-semibold">{{ group.label }}</span>
        <span class="text-muted font-mono text-xs">{{ formatCurrency(group.total) }}</span>
      </div>

      <div class="border-accented bg-default rounded-2xl border shadow-sm">
        <div class="divide-accented divide-y">
          <TransactionRow
            v-for="transaction in group.transactions"
            :key="transaction.id"
            :transaction
            :categories
            :picker-open="openRowId === transaction.id"
            @toggle-picker="toggleRow(transaction.id)"
            @close-picker="openRowId = null"
            @select-category="key => selectCategory(transaction.id, key)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
