<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { DRAWER_UI } from '@/lib/constants';
import { m } from '@/paraglide/messages';

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
    :title="m.rule_delete_title()"
    :description="m.rule_delete_description({ count: rule.matches })"
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
          {{ m.common_cancel() }}
        </UButton>

        <UButton
          color="error"
          block
          size="xl"
          class="justify-center"
          @click="emit('delete')"
        >
          {{ m.rule_delete_confirm() }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
