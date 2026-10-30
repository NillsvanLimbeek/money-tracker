<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { ref } from 'vue';
import { RULE_OPERATORS } from '@/lib/constants';

interface Props {
  rule: CategoryRule;
  categoryLabel: string;
}

const { rule } = defineProps<Props>();
const emit = defineEmits<{ (e: 'delete', id: string): void }>();

const BARS = [1, 2, 3];

const isConfirming = ref(false);

const menuItems = [[{
  label: 'Delete',
  icon: 'i-lucide-trash-2',
  color: 'error' as const,
  onSelect: () => {
    isConfirming.value = true;
  },
}]];
</script>

<template>
  <div class="flex flex-col gap-3 px-4 py-3">
    <div class="flex items-center gap-2">
      <span class="border-accented bg-elevated flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-xs">
        <span class="flex items-end gap-0.5">
          <span
            v-for="bar in BARS"
            :key="bar"
            class="w-0.5 rounded-full"
            :class="{
              'bg-highlighted': bar <= RULE_OPERATORS[rule.operator].strength,
              'bg-accented': bar > RULE_OPERATORS[rule.operator].strength }"
            :style="{ height: `${bar * 4}px` }"
          />
        </span>

        {{ RULE_OPERATORS[rule.operator].label }}
      </span>

      <span class="text-highlighted min-w-0 flex-1 truncate font-mono">“{{ rule.pattern }}”</span>

      <UDropdownMenu
        :items="menuItems"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-ellipsis"
          aria-label="Rule actions"
        />
      </UDropdownMenu>
    </div>

    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-arrow-right"
        class="text-muted size-4"
      />

      <CategoryBadge
        :category-key="rule.categoryKey"
        :label="categoryLabel"
        :show-icon="false"
        :interactive="false"
      />

      <span class="ml-auto font-mono text-sm">
        <span class="text-highlighted">{{ rule.matches }}</span>
        <span class="text-muted">&nbsp;{{ rule.matches === 1 ? 'match' : 'matches' }}</span>
      </span>
    </div>

    <div
      v-if="isConfirming"
      class="bg-error/10 border-error/20 flex flex-col gap-3 rounded-xl border p-4"
    >
      <div class="flex flex-col gap-1">
        <p class="text-highlighted font-medium">
          Delete this rule?
        </p>

        <p class="text-toned text-sm">
          The {{ rule.matches }} matched {{ rule.matches === 1 ? 'transaction keeps' : 'transactions keep' }} their current category.
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <UButton
          color="neutral"
          variant="outline"
          block
          size="lg"
          class="justify-center"
          @click="isConfirming = false"
        >
          Cancel
        </UButton>

        <UButton
          color="error"
          block
          size="lg"
          class="justify-center"
          @click="emit('delete', rule.id)"
        >
          Delete rule
        </UButton>
      </div>
    </div>
  </div>
</template>
