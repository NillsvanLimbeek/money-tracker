<script setup lang="ts">
import { format, subMonths } from 'date-fns';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import MonthPickerDrawer from '@/components/month-picker-drawer/MonthPickerDrawer.vue';
import MonthPicker from '@/components/month-picker/MonthPicker.vue';
import { useMonthTotals } from '@/features/transactions/composables';
import { useImportedMonths, useTransactions } from '@/lib/api/transactions/transactions.queries';
import { m } from '@/paraglide/messages';
import { useDateStore } from '@/stores/date';

const { selectedMonth, monthKey } = storeToRefs(useDateStore());
const isMonthPickerOpen = ref(false);

const importedMonthsQuery = useImportedMonths();

const previousMonthKey = computed(() => format(subMonths(selectedMonth.value, 1), 'yyyy-MM'));
const currentQuery = useTransactions(monthKey);
const previousQuery = useTransactions(previousMonthKey);

const { income, expense } = useMonthTotals(() => currentQuery.data.value ?? []);
const { income: previousIncome, expense: previousExpense } = useMonthTotals(() => previousQuery.data.value ?? []);
</script>

<template>
  <PageHeader :title="m.insights_title()" />

  <MonthPicker
    v-model="selectedMonth"
    @open="isMonthPickerOpen = true"
  />

  <MonthPickerDrawer
    v-model="selectedMonth"
    v-model:open="isMonthPickerOpen"
    :imported-months="importedMonthsQuery.data.value ?? []"
  />

  <InsightsOverview
    class="mt-4"
    :month="selectedMonth"
    :income
    :expense
    :previous-income
    :previous-expense
  />

  <div class="h-28" />
</template>
