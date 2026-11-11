<script setup lang="ts">
import type { Category, Transaction } from '@/lib/types';
import { computed, ref } from 'vue';
import TransactionRow from '@/components/transaction-row/TransactionRow.vue';
import { groupTransactionsByDay } from '@/features/transactions/utils';
import { formatCurrency } from '@/lib/utils';

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
  <div class="flex flex-col gap-4 p-4">
    <section
      v-for="group in groups"
      :key="group.key"
      class="border-accented bg-default overflow-hidden rounded-2xl border shadow-sm"
    >
      <div class="border-accented bg-elevated text-muted flex items-center justify-between border-b px-4 py-2 font-mono text-xs tracking-wide uppercase">
        <h3>{{ group.label }}</h3>
        <span>{{ formatCurrency(group.total) }}</span>
      </div>

      <div class="divide-accented divide-y">
        <TransactionRow
          v-for="transaction in group.transactions"
          :key="transaction.id"
          :transaction
          :categories
          grouped
          :picker-open="openRowId === transaction.id"
          @toggle-picker="toggleRow(transaction.id)"
          @close-picker="openRowId = null"
          @select-category="key => selectCategory(transaction.id, key)"
        />
      </div>
    </section>
  </div>
</template>
