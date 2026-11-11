<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { DRAWER_UI, RULE_OPERATORS } from '@/lib/constants';
import { m } from '@/paraglide/messages';

interface Props {
  rule: CategoryRule;
  categoryLabel: string;
}

const { rule, categoryLabel } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();

const isOpen = defineModel<boolean>('open', { required: true });
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="m.rule_actions_title({ operator: RULE_OPERATORS[rule.operator].label, pattern: rule.pattern })"
    :description="m.rule_actions_description({ category: categoryLabel, count: rule.matches })"
    :ui="DRAWER_UI"
  >
    <template #body>
      <div class="flex flex-col gap-3">
        <UButton
          color="neutral"
          variant="outline"
          block
          size="xl"
          icon="i-lucide-pencil"
          class="justify-center"
          @click="emit('edit')"
        >
          {{ m.common_edit() }}
        </UButton>

        <UButton
          color="error"
          variant="soft"
          block
          size="xl"
          icon="i-lucide-trash-2"
          class="justify-center"
          @click="emit('delete')"
        >
          {{ m.common_delete() }}
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
