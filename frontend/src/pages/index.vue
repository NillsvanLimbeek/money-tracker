<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import CategoryDrawer from '@/components/category-drawer/CategoryDrawer.vue';
import MonthSummary from '@/components/month-summary/MonthSummary.vue';
import QueryBoundary from '@/components/query-boundary/QueryBoundary.vue';
import TransactionList from '@/components/transaction-list/TransactionList.vue';
import { useTransactions, useUpdateTransactionCategory } from '@/lib/api/transactions/transactions.queries';
import { CATEGORIES } from '@/lib/constants';
import { categoryIsSelected } from '@/lib/utils';

const now = new Date();
const selectedMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1));

const transactionsQuery = useTransactions(() => format(selectedMonth.value, 'yyyy-MM'));
const { mutate: updateCategory } = useUpdateTransactionCategory();

const transactions = computed(() => transactionsQuery.data.value ?? []);

const income = computed(() => transactions.value
  .filter(t => t.amount > 0)
  .reduce((sum, t) => sum + t.amount, 0));
const expense = computed(() => transactions.value
  .filter(t => t.amount < 0)
  .reduce((sum, t) => sum - t.amount, 0));

function changeCategory(payload: { id: string; categoryKey: string }): void {
  updateCategory(payload);
}

const search = ref('');
const isFilterOpen = ref(false);
const selectedCategories = ref<string[]>([]);

function toggleCategory(key: string): void {
  selectedCategories.value = categoryIsSelected(selectedCategories.value, key)
    ? selectedCategories.value.filter(k => k !== key)
    : [...selectedCategories.value, key];
}

function resetCategories(): void {
  selectedCategories.value = [];
}
</script>

<template>
  <div class="bg-olive-50 sticky top-0 z-10">
    <PageHeader title="Transactions" />

    <div class="border-accented flex w-full gap-4 border-b px-4 pb-4">
      <UInput
        v-model="search"
        class="w-full"
        size="lg"
        icon="i-lucide-search"
        placeholder="Search Transactions"
      />

      <CategoryDrawer
        v-model:open="isFilterOpen"
        :categories="CATEGORIES"
        :selected-categories
        @toggle-category="toggleCategory"
        @reset-categories="resetCategories"
      />
    </div>
  </div>

  <MonthSummary
    v-model="selectedMonth"
    :income="income"
    :expense="expense"
  />

  <QueryBoundary :query="transactionsQuery">
    <template #default="{ data }">
      <TransactionList
        :transactions="data"
        :categories="CATEGORIES"
        @change-category="changeCategory"
      />
    </template>
  </QueryBoundary>

  <div class="h-28" />
</template>
