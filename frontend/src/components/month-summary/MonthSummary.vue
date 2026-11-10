<script setup lang="ts">
import { computed } from 'vue';
import CurrencyAmount from '@/components/currency-amount/CurrencyAmount.vue';
import { m } from '@/paraglide/messages';

interface Props {
  income: number;
  expense: number;
}

const { income, expense } = defineProps<Props>();

const net = computed(() => income - expense);
</script>

<template>
  <Box>
    <CurrencyAmount
      :label="m.summary_in()"
      :value="income"
      class="text-primary text-sm"
    />

    <CurrencyAmount
      :label="m.summary_out()"
      :value="-expense"
      class="text-highlighted text-sm"
    />

    <CurrencyAmount
      :label="m.summary_net()"
      :value="net"
      class="text-highlighted pt-1 text-lg"
      align="end"
    />
  </Box>
</template>
