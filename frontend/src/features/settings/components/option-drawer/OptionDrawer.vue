<script setup lang="ts" generic="T extends string">
import { DRAWER_UI } from '@/lib/constants';

interface Props {
  title: string;
  options: { value: T; label: string }[];
}

const { options } = defineProps<Props>();

const isOpen = defineModel<boolean>('open', { required: true });
const model = defineModel<T>({ required: true });

function select(value: T): void {
  model.value = value;
  isOpen.value = false;
}
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title
    :ui="DRAWER_UI"
  >
    <template #body>
      <div class="flex flex-col gap-3">
        <UButton
          v-for="option in options"
          :key="option.value"
          color="neutral"
          :variant="model === option.value ? 'soft' : 'outline'"
          block
          size="xl"
          class="justify-between font-mono"
          :trailing-icon="model === option.value ? 'i-lucide-check' : undefined"
          @click="select(option.value)"
        >
          {{ option.label }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
