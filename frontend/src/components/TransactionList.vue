<script setup lang="ts">
import type { Category, Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import CategoryBadge from '@/components/CategoryBadge.vue';
import CategoryPicker from '@/components/CategoryPicker.vue';
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

function categoryLabel(key: string) {
  return categories.find(category => category.key === key)?.label ?? key;
}

function toggleRow(id: string) {
  openRowId.value = openRowId.value === id ? null : id;
}

function selectCategory(id: string, categoryKey: string) {
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
          <div
            v-for="transaction in group.transactions"
            :key="transaction.id"
            class="px-4 py-4"
          >
            <div class="flex items-start gap-3">
              <div class="text-muted flex w-9 shrink-0 flex-col items-start pt-0.5 font-mono text-xs leading-tight uppercase">
                <span>{{ format(transaction.date, 'dd') }}</span>
                <span>{{ format(transaction.date, 'MMM') }}</span>
              </div>

              <div class="flex min-w-0 flex-1 flex-col items-start gap-2">
                <span class="text-highlighted truncate font-semibold">{{ transaction.merchant }}</span>

                <CategoryBadge
                  :category-key="transaction.categoryKey"
                  :label="categoryLabel(transaction.categoryKey)"
                  @click="toggleRow(transaction.id)"
                />
              </div>

              <span
                class="shrink-0 font-bold"
                :class="transaction.amount > 0 ? 'text-primary' : 'text-highlighted'"
              >{{ formatCurrency(transaction.amount) }}</span>
            </div>

            <CategoryPicker
              v-if="openRowId === transaction.id"
              class="mt-3"
              :categories="categories"
              :selected-key="transaction.categoryKey"
              @select="key => selectCategory(transaction.id, key)"
              @close="openRowId = null"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
