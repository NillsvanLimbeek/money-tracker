<script setup lang="ts">
interface Props {
  stepCount: number;
  step: number;
}

const { stepCount, step } = defineProps<Props>();
</script>

<template>
  <div class="flex gap-2 px-4">
    <span
      v-for="n in stepCount"
      :key="n"
      class="h-1.5 flex-1 rounded-full"
      :class="n <= step ? 'bg-primary' : 'bg-accented'"
    />
  </div>
</template>
