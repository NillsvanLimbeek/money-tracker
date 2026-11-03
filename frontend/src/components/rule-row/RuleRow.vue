<script setup lang="ts">
import type { CategoryRule } from '@/lib/types';
import { ref } from 'vue';
import { RULE_OPERATORS } from '@/lib/constants';
import { m } from '@/paraglide/messages';

interface Props {
  rule: CategoryRule;
  categoryLabel: string;
}

const { rule } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'edit', rule: CategoryRule): void;
  (e: 'delete', id: string): void;
}>();

const BARS = [1, 2, 3];

const isMenuOpen = ref(false);
const isConfirming = ref(false);

function edit(): void {
  isMenuOpen.value = false;
  emit('edit', rule);
}

function confirmDelete(): void {
  isConfirming.value = false;
  emit('delete', rule.id);
}

function startDelete(): void {
  isMenuOpen.value = false;
  isConfirming.value = true;
}
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

      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="i-lucide-ellipsis"
        :aria-label="m.rule_actions_aria()"
        @click="isMenuOpen = true"
      />
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
        <span class="text-muted">&nbsp;{{ m.rule_matches_label({ count: rule.matches }) }}</span>
      </span>
    </div>

    <RuleActions
      v-model:open="isMenuOpen"
      :rule
      :category-label
      @edit="edit"
      @delete="startDelete"
    />

    <RuleDeleteDrawer
      v-model:open="isConfirming"
      :rule
      @delete="confirmDelete"
    />
  </div>
</template>
