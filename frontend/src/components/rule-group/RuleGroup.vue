<script setup lang="ts">
import type { RuleGroup } from '@/lib/utils';

interface Props {
  group: RuleGroup;
}

const { group } = defineProps<Props>();
const emit = defineEmits<{ (e: 'delete', id: string): void }>();
</script>

<template>
  <section class="border-accented bg-default overflow-hidden rounded-2xl border shadow-sm">
    <header class="border-accented bg-elevated flex items-center justify-between border-b px-4 py-3">
      <CategoryBadge
        :category-key="group.category.key"
        :label="group.category.label"
        :show-icon="false"
        :interactive="false"
      />

      <span class="text-muted font-mono text-xs">
        {{ group.rules.length }} {{ group.rules.length === 1 ? 'rule' : 'rules' }} · {{ group.matches }} categorised
      </span>
    </header>

    <div class="divide-accented flex flex-col divide-y">
      <RuleRow
        v-for="rule in group.rules"
        :key="rule.id"
        :rule
        :category-label="group.category.label"
        @delete="emit('delete', $event)"
      />
    </div>
  </section>
</template>
