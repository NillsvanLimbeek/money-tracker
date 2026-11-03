<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { DRAWER_UI } from '@/lib/constants';

interface Props {
  rule: CategoryRule;
}

const { rule } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'delete'): void;
}>();

const isOpen = defineModel<boolean>('open', { required: true });
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    title="Delete this rule?"
    :description="`The ${rule.matches} matched ${rule.matches === 1 ? 'transaction keeps' : 'transactions keep'} their current category.`"
    :ui="DRAWER_UI"
  >
    <template #body>
      <div class="flex flex-col gap-3">
        <UButton
          color="neutral"
          variant="outline"
          block
          size="xl"
          class="justify-center"
          @click="isOpen = false"
        >
          Cancel
        </UButton>

        <UButton
          color="error"
          block
          size="xl"
          class="justify-center"
          @click="emit('delete')"
        >
          Delete rule
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
