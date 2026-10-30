<script setup lang="ts">
import type { Category, Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import CategoryBadge from '@/components/category-badge/CategoryBadge.vue';
import CategoryPicker from '@/components/category-picker/CategoryPicker.vue';
import { formatCurrency, splitNotes } from '@/lib/utils';

interface Props {
  transaction: Transaction;
  categories: Category[];
  pickerOpen?: boolean;
  // Shows a checkbox and a read-only category, as on the import review screen.
  selectable?: boolean;
  selected?: boolean;
  // Already stored: dimmed, labelled "Already imported" and not selectable.
  duplicate?: boolean;
  // Sits under a day header: the date leaves the row, a category dot leads it and the badge only shows when expanded.
  grouped?: boolean;
}

const { transaction, categories, pickerOpen = false, selectable = false, selected = false, duplicate = false, grouped = false } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'togglePicker'): void;
  (e: 'closePicker'): void;
  (e: 'selectCategory', categoryKey: string): void;
  (e: 'toggle'): void;
}>();

const expanded = ref(false);

const categoryLabel = computed(() =>
  categories.find(category => category.key === transaction.categoryKey)?.label ?? transaction.categoryKey);
const noteLines = computed(() => (transaction.notes ? splitNotes(transaction.notes) : []));
const amountClass = computed(() => {
  if (duplicate)
    return 'text-muted';
  return transaction.amount > 0 ? 'text-primary' : 'text-highlighted';
});
</script>

<template>
  <div
    class="flex w-full cursor-pointer items-stretch text-left"
    :class="{ 'opacity-60': duplicate }"
    @click="expanded = !expanded"
  >
    <div class="min-w-0 flex-1 py-4 pr-3 pl-4">
      <div class="flex items-start gap-3">
        <UCheckbox
          v-if="selectable"
          :model-value="selected"
          :disabled="duplicate"
          :aria-label="transaction.merchant"
          size="lg"
          class="mt-0.5"
          @click.stop
          @update:model-value="emit('toggle')"
        />

        <span
          v-if="grouped"
          class="mt-2 size-2.5 shrink-0 rounded-full"
          :style="{ backgroundColor: `var(--category-${transaction.categoryKey}-text)` }"
          aria-hidden="true"
        />

        <div
          v-else
          class="text-muted flex w-9 shrink-0 flex-col items-start pt-0.5 font-mono text-xs leading-tight uppercase"
        >
          <p>{{ format(transaction.date, 'dd') }}</p>
          <p>{{ format(transaction.date, 'MMM') }}</p>
        </div>

        <div class="flex min-w-0 flex-1 flex-col items-start gap-2">
          <p
            class="w-full font-semibold"
            :class="{
              'text-muted': duplicate,
              'text-highlighted': !duplicate,
              'wrap-break-word': expanded,
              'truncate': !expanded,
            }"
          >
            {{ transaction.merchant }}
          </p>

          <div
            v-if="!duplicate && (!grouped || expanded || pickerOpen)"
            @click.stop
          >
            <CategoryBadge
              :category-key="transaction.categoryKey"
              :label="categoryLabel"
              :show-icon="!selectable"
              :interactive="!selectable"
              @click="emit('togglePicker')"
            />
          </div>

          <p
            v-if="duplicate"
            class="border-accented text-muted rounded-full border border-dashed px-3 py-1 text-xs"
          >
            Already imported
          </p>
        </div>

        <p
          class="shrink-0 font-bold"
          :class="amountClass"
        >
          {{ formatCurrency(transaction.amount) }}
        </p>
      </div>

      <div
        v-if="expanded && noteLines.length"
        class="mt-4 ml-5"
      >
        <TransactionDescription :note-lines />
      </div>

      <CategoryPicker
        v-if="pickerOpen && !selectable"
        class="mt-3"
        :categories="categories"
        :selected-key="transaction.categoryKey"
        @click.stop
        @select="key => emit('selectCategory', key)"
        @close="emit('closePicker')"
      />
    </div>

    <div class="border-accented flex w-12 shrink-0 items-start justify-center border-l pt-4.5">
      <button
        type="button"
        class="text-muted hover:text-highlighted cursor-pointer"
        :aria-expanded="expanded"
        aria-label="Toggle details"
      >
        <UIcon
          :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4"
        />
      </button>
    </div>
  </div>
</template>
