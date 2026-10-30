<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

interface Props {
  label: string;
  description?: string;
  to?: string;
  action?: boolean;
}

const { to, action = false } = defineProps<Props>();

defineSlots<{
  trailing?: () => unknown;
}>();

const interactive = computed(() => !!to || action);
const element = computed(() => {
  if (to)
    return RouterLink;

  return action ? 'button' : 'div';
});
</script>

<template>
  <component
    :is="element"
    :to
    :type="action ? 'button' : undefined"
    class="flex w-full items-center gap-3 px-4 py-4 text-left"
    :class="{ 'active:bg-elevated': interactive }"
  >
    <span class="flex min-w-0 flex-1 flex-col">
      <span
        class="truncate text-base font-normal"
        :class="action ? 'text-primary' : 'text-highlighted'"
      >
        {{ label }}
      </span>

      <span
        v-if="description"
        class="text-muted truncate text-sm"
      >
        {{ description }}
      </span>
    </span>

    <slot name="trailing">
      <UIcon
        v-if="to"
        name="i-lucide-chevron-right"
        class="text-muted size-4 shrink-0"
      />
    </slot>
  </component>
</template>
