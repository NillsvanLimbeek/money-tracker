<script setup lang="ts" generic="T">
import type { UseQueryReturnType } from '@tanstack/vue-query';

interface Props {
  query: UseQueryReturnType<T, Error>;
}

const { query } = defineProps<Props>();
defineSlots<{ default: (props: { data: NonNullable<T> }) => unknown }>();
</script>

<template>
  <h1>Query Boundry</h1>

  <div v-if="query.isLoading.value">
    Loading...
  </div>

  <div v-else-if="query.error.value">
    {{ query.error.value }}
  </div>

  <slot
    v-else
    :data="query.data.value as NonNullable<T>"
  />
</template>
