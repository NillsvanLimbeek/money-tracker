<script setup lang="ts">
import type { Category, CategoryRule, RulePreview } from '@/lib/types';
import { computed } from 'vue';
import { CATEGORIES, DRAWER_UI } from '@/lib/constants';
import { validateRule } from '@/lib/utils';

interface Props {
  category: Category;
  rules: CategoryRule[];
  preview?: RulePreview;
  pending?: boolean;
}

const { category, rules, preview, pending = false } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'create'): void;
}>();

const isOpen = defineModel<boolean>('open', { required: true });
const pattern = defineModel<string>('pattern', { required: true });

const validation = computed(() => validateRule(
  { pattern: pattern.value, operator: 'contains' },
  rules,
  CATEGORIES,
  preview?.descriptions.length,
));

const errorMessage = computed(() => validation.value.level === 'error' ? (validation.value.message ?? undefined) : undefined);

const matchText = computed(() => {
  if (!preview || pattern.value.trim() === '')
    return null;

  return `Matches ${preview.count} ${preview.count === 1 ? 'transaction' : 'transactions'}`;
});
</script>

<template>
  <UDrawer
    v-model:open="isOpen"
    :title="`Always categorise as ${category.label}?`"
    description="Create a rule so future transactions with this description are categorised automatically."
    :ui="DRAWER_UI"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <UFormField
          label="Description contains"
          :error="errorMessage"
        >
          <UInput
            v-model="pattern"
            size="xl"
            class="w-full font-mono"
          />
        </UFormField>

        <p
          v-if="validation.level === 'warning'"
          role="alert"
          class="bg-warning/10 border-warning/20 text-warning rounded-xl border p-3 text-sm"
        >
          {{ validation.message }}
        </p>

        <p
          v-if="matchText"
          class="text-muted text-sm"
        >
          {{ matchText }}
        </p>

        <div class="flex flex-col gap-3">
          <UButton
            block
            size="xl"
            class="justify-center"
            :loading="pending"
            :disabled="!validation.canSave"
            @click="emit('create')"
          >
            Create rule
          </UButton>

          <UButton
            color="neutral"
            variant="outline"
            block
            size="xl"
            class="justify-center"
            @click="isOpen = false"
          >
            Not now
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
