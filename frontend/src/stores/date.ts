import { format, startOfMonth } from 'date-fns';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * The month the user is looking at, shared by every page that shows a month picker.
 *
 * Starts on the current month and resets on reload.
 */
export const useDateStore = defineStore('date', () => {
  const selectedMonth = ref(startOfMonth(new Date()));

  /** The selected month as `YYYY-MM`, as the transactions API expects. */
  const monthKey = computed(() => format(selectedMonth.value, 'yyyy-MM'));

  return { selectedMonth, monthKey };
});
