<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { DRAWER_UI, RULE_OPERATORS } from '@/lib/constants';

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
    :title="`Rule ${RULE_OPERATORS[rule.operator].label} “${rule.pattern}”`"
    :description="`Assigns ${categoryLabel} · ${rule.matches} ${rule.matches === 1 ? 'match' : 'matches'}`"
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
          Edit
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
          Delete
        </UButton>
      </div>
    </template>
  </UDrawer>
</template>
