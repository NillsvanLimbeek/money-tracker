<script setup lang="ts">
const { title } = defineProps<{ title: string }>();
</script>

<template>
  <h1 class="text-highlighted flex justify-center p-4 text-xl">
    {{ title }}
  </h1>
</template>
