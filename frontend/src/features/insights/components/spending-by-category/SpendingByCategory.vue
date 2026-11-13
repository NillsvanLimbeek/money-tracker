<script setup lang="ts">
import type { Transaction } from '@/lib/types';
import { computed, ref } from 'vue';
import { formatPercent, groupSpendingByCategory } from '@/features/insights/utils';
import { CATEGORIES } from '@/lib/constants/categories';
import { formatEuros, formatLocalised } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  month: Date;
  transactions: Transaction[];
  previousTransactions: Transaction[];
}

const { month, transactions, previousTransactions } = defineProps<Props>();

const activeKey = ref<string | null>(null);

const spends = computed(() => groupSpendingByCategory(transactions, previousTransactions));
const spent = computed(() => spends.value.reduce((sum, spend) => sum + spend.amount, 0));

const biggest = computed(() => spends.value[0]);
const biggestChange = computed(() => spends.value
  .filter(spend => spend.change !== 0)
  .reduce<(typeof spends.value)[number] | undefined>((top, spend) => (top === undefined || Math.abs(spend.change) > Math.abs(top.change) ? spend : top), undefined));

const monthName = computed(() => formatLocalised(month, 'MMMM'));

function labelOf(categoryKey: string): string {
  return CATEGORIES.find(category => category.key === categoryKey)?.label ?? categoryKey;
}

function toggle(categoryKey: string | null): void {
  activeKey.value = categoryKey === null || categoryKey === activeKey.value ? null : categoryKey;
}
</script>

<template>
  <section class="bg-default rounded-3xl p-6 shadow-sm">
    <h2 class="text-highlighted text-lg font-bold">
      {{ m.insights_spending_title() }}
    </h2>

    <p
      v-if="spends.length === 0"
      class="text-muted mt-4 text-sm"
    >
      {{ m.insights_spending_empty() }}
    </p>

    <template v-else>
      <div class="mt-6">
        <CategoryDonut
          :spends
          :active-key
          @select="toggle"
        >
          <span class="text-muted font-mono text-xs tracking-widest uppercase">{{ m.insights_spent_in({ month: monthName }) }}</span>
          <span class="text-highlighted font-mono text-3xl font-bold">{{ formatEuros(spent) }}</span>
        </CategoryDonut>
      </div>

      <div class="mt-6 flex flex-col items-center gap-3">
        <p
          v-if="biggest"
          class="bg-elevated flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <span
            class="size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(--chart-${biggest.categoryKey}, var(--chart-other))` }"
          />
          <span class="text-toned">{{ m.insights_biggest() }}</span>
          <span class="text-dimmed">:</span>
          <span class="text-highlighted truncate font-bold">{{ labelOf(biggest.categoryKey) }}</span>
          <span class="text-highlighted font-mono font-bold">{{ biggest.share }}%</span>
        </p>

        <p
          v-if="biggestChange"
          class="bg-elevated flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm"
        >
          <span
            class="size-3 shrink-0 rounded-full"
            :style="{ backgroundColor: `var(--chart-${biggestChange.categoryKey}, var(--chart-other))` }"
          />
          <span class="text-toned">{{ m.insights_biggest_change() }}</span>
          <span class="text-dimmed">:</span>
          <span class="text-highlighted truncate font-bold">{{ labelOf(biggestChange.categoryKey) }}</span>
          <span
            class="font-mono font-bold"
            :class="biggestChange.change > 0 ? 'text-error' : 'text-success'"
          >{{ formatPercent(biggestChange.change) }}</span>
        </p>
      </div>

      <ul class="border-accented mt-6 flex flex-col gap-6 border-t border-dashed pt-6">
        <li
          v-for="spend in spends"
          :key="spend.categoryKey"
        >
          <CategorySpendRow
            :spend
            :dimmed="activeKey !== null && activeKey !== spend.categoryKey"
          />
        </li>
      </ul>
    </template>
  </section>
</template>
