<script setup lang="ts">
import { format, getMonth, getYear, isAfter, startOfMonth } from 'date-fns';
import { computed, ref, watch } from 'vue';
import { DRAWER_UI } from '@/lib/constants';
import { formatLocalised } from '@/lib/utils';
import { m } from '@/paraglide/messages';

interface Props {
  /** Months (`YYYY-MM`) that have imported transactions. */
  importedMonths?: string[];
  /** Today's date, so the current month and the disabled future months can be worked out. */
  today?: Date;
}

const { importedMonths = [], today = new Date() } = defineProps<Props>();

const isOpen = defineModel<boolean>('open', { required: true });
const modelValue = defineModel<Date>({ required: true });

const year = ref(getYear(modelValue.value));

// Reopening the sheet starts on the year of the selected month.
watch(isOpen, (open) => {
  if (open)
    year.value = getYear(modelValue.value);
});

const currentMonth = computed(() => startOfMonth(today));

const months = computed(() => Array.from({ length: 12 }, (_, index) => {
  const date = new Date(year.value, index, 1);

  return {
    date,
    label: formatLocalised(date, 'MMM'),
    isSelected: getYear(modelValue.value) === year.value && getMonth(modelValue.value) === index,
    isCurrent: date.getTime() === currentMonth.value.getTime(),
    isImported: importedMonths.includes(format(date, 'yyyy-MM')),
    isFuture: isAfter(date, currentMonth.value),
  };
}));

const isLastYear = computed(() => year.value >= getYear(today));

function select(date: Date): void {
  modelValue.value = date;
  isOpen.value = false;
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="m.month_pick()"
    :ui="DRAWER_UI"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div class="bg-elevated flex items-center justify-between rounded-xl p-1">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-chevron-left"
            square
            :aria-label="m.month_year_previous()"
            @click="year--"
          />

          <span class="text-highlighted font-mono font-bold">{{ year }}</span>

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-chevron-right"
            square
            :disabled="isLastYear"
            :aria-label="m.month_year_next()"
            @click="year++"
          />
        </div>

        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="month in months"
            :key="month.label"
            type="button"
            :disabled="month.isFuture"
            :aria-pressed="month.isSelected"
            class="relative flex h-14 items-center justify-center rounded-xl border-2 font-medium disabled:opacity-40"
            :class="{
              'bg-primary border-primary text-inverted': month.isSelected,
              'border-highlighted text-highlighted': !month.isSelected && month.isCurrent,
              'border-accented text-highlighted': !month.isSelected && !month.isCurrent,
            }"
            @click="select(month.date)"
          >
            {{ month.label }}
            <span
              class="absolute bottom-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full"
              :class="{
                'bg-inverted': month.isImported && month.isSelected,
                'bg-primary': month.isImported && !month.isSelected,
              }"
              :data-imported="month.isImported"
            />
          </button>
        </div>

        <div class="text-muted flex items-center gap-6 text-sm">
          <span class="flex items-center gap-2">
            <span class="bg-primary size-1.5 rounded-full" />
            {{ m.month_legend_imported() }}
          </span>

          <span class="flex items-center gap-2">
            <span class="border-highlighted size-3.5 rounded-sm border-2" />
            {{ m.month_legend_current() }}
          </span>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
