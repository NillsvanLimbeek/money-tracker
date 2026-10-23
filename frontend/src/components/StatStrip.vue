<script setup lang="ts">
export interface Stat {
  label: string;
  value: string | number;
  valueClass?: string;
}

interface Props {
  stats: Stat[];
}

const { stats } = defineProps<Props>();
</script>

<template>
  <dl class="border-accented bg-default divide-accented grid auto-cols-fr grid-flow-col divide-x rounded-2xl border shadow-sm">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col gap-1 p-3"
    >
      <dt class="text-muted font-mono text-xs tracking-wide uppercase">
        {{ stat.label }}
      </dt>

      <dd
        class="text-xl font-semibold"
        :class="stat.valueClass ?? 'text-highlighted'"
      >
        {{ stat.value }}
      </dd>
    </div>
  </dl>
</template>
