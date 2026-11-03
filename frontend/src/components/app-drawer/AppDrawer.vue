<script setup lang="ts">
import { m } from '@/paraglide/messages';

interface Props {
  title: string;
}

defineProps<Props>();

const isOpen = defineModel<boolean>('open', { required: true });

const DRAWER_UI = {
  overlay: 'bg-black/50',
  content: 'h-[92dvh]',
  container: 'overflow-hidden',
  body: 'min-h-0 flex-1 overflow-y-auto',
};
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :ui="DRAWER_UI"
  >
    <template #header>
      <h2 class="text-highlighted flex-1 text-xl font-semibold">
        {{ title }}
      </h2>

      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        :aria-label="m.common_close()"
        @click="isOpen = false"
      />
    </template>

    <template #body>
      <slot />
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
