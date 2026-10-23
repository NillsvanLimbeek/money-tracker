<script setup lang="ts">
interface Props {
  title: string;
  subtitle: string;
}

const { title, subtitle } = defineProps<Props>();
</script>

<template>
  <div class="flex flex-col gap-6 p-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-highlighted text-2xl font-bold">
        {{ title }}
      </h2>

      <p class="text-muted">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
