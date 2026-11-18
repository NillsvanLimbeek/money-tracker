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
  body: 'flex min-h-0 flex-1 flex-col',
  wrapper: 'flex-1',
  title: 'text-highlighted text-xl font-semibold',
};
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title
    :ui="DRAWER_UI"
  >
    <template #actions>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        :aria-label="m.common_close()"
        @click="isOpen = false"
      />
    </template>

    <template #body>
      <!-- The scroll container itself must be focusable so keyboard users can scroll it. -->
      <div
        class="min-h-0 flex-1 overflow-y-auto"
        role="region"
        :aria-label="title"
        tabindex="0"
      >
        <slot />
      </div>
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UDrawer>
</template>
