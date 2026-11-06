<script setup lang="ts">
import type { Category, Transaction } from '@/lib/types';
import { m } from '@/paraglide/messages';

interface Props {
  selectedCategories: string[];
  selectedCategoryItems: Category[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
}

const { selectedCategories, selectedCategoryItems, transactions, filteredTransactions } = defineProps<Props>();
const emit = defineEmits<{ (e: 'clear'): void }>();
</script>

<template>
  <div
    v-if="selectedCategories.length > 0"
    class="bg-primary/10 border-accented flex items-center gap-3 border-b px-4 py-3 text-sm"
  >
    <span class="flex gap-1">
      <span
        v-for="category in selectedCategoryItems"
        :key="category.key"
        class="size-2 rounded-full"
        :style="{ backgroundColor: `var(--category-${category.key}-text)` }"
      />
    </span>

    <p class="min-w-0 flex-1 truncate">
      <strong class="text-highlighted">{{ m.filter_results_count({ shown: filteredTransactions.length, total: transactions.length }) }}</strong>
      <span class="text-muted">
        {{ m.filter_results_in({ categories: selectedCategoryItems.map(c => c.label).join(', ') }) }}
      </span>
    </p>

    <UButton
      size="sm"
      color="primary"
      variant="outline"
      @click="emit('clear')"
    >
      {{ m.filter_clear() }}
    </UButton>
  </div>
</template>
