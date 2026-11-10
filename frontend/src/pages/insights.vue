<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import MonthPickerDrawer from '@/components/month-picker-drawer/MonthPickerDrawer.vue';
import MonthPicker from '@/components/month-picker/MonthPicker.vue';
import { useImportedMonths } from '@/lib/api/transactions/transactions.queries';
import { m } from '@/paraglide/messages';
import { useDateStore } from '@/stores/date';

const { selectedMonth } = storeToRefs(useDateStore());
const isMonthPickerOpen = ref(false);

const importedMonthsQuery = useImportedMonths();
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

  <div class="h-28" />
</template>
