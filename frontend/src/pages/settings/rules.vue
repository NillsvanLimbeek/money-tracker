<script setup lang="ts">
import { computed, ref } from 'vue';
import { useCategoryRules, useDeleteCategoryRule } from '@/lib/api/category-rules/category-rules.queries';
import { CATEGORIES } from '@/lib/constants';
import { groupRulesByCategory } from '@/lib/utils';

const rulesQuery = useCategoryRules();
const { mutate: deleteRule } = useDeleteCategoryRule();

const search = ref('');
const selectedKey = ref<string | null>(null);

const rules = computed(() => rulesQuery.data.value ?? []);

const chips = computed(() => groupRulesByCategory(rules.value, CATEGORIES)
  .map(group => ({ key: group.category.key, label: group.category.label, count: group.rules.length })));

const groups = computed(() => {
  const term = search.value.trim().toLowerCase();
  const filtered = rules.value.filter(rule => rule.pattern.toLowerCase().includes(term)
    && (!selectedKey.value || rule.categoryKey === selectedKey.value));

  return groupRulesByCategory(filtered, CATEGORIES);
});

function addRule(): void {}
</script>

<template>
  <div class="flex flex-col gap-4 px-4 pt-4">
    <div class="flex items-center justify-between">
      <UButton
        to="/settings"
        variant="link"
        icon="i-lucide-chevron-left"
        class="p-0"
      >
        Settings
      </UButton>

      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="addRule"
      >
        Add rule
      </UButton>
    </div>
  </div>

  <PageHeader title="Category rules" />

  <QueryBoundary :query="rulesQuery">
    <RulesEmptyState
      v-if="rules.length === 0"
      @add="addRule"
    />

    <div
      v-else
      class="flex flex-col gap-4 p-4"
    >
      <UInput
        v-model="search"
        size="xl"
        icon="i-lucide-search"
        placeholder="Search patterns"
      />

      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          class="border-accented flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-medium"
          :class="{ 'border-primary bg-primary/10 text-primary': !selectedKey, 'bg-default text-highlighted': selectedKey }"
          @click="selectedKey = null"
        >
          All <span class="font-mono text-sm opacity-70">{{ rules.length }}</span>
        </button>

        <button
          v-for="chip in chips"
          :key="chip.key"
          type="button"
          class="border-accented flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-medium"
          :class="{ 'border-primary bg-primary/10 text-primary': selectedKey === chip.key, 'bg-default text-highlighted': selectedKey !== chip.key }"
          @click="selectedKey = chip.key"
        >
          {{ chip.label }} <span class="font-mono text-sm opacity-70">{{ chip.count }}</span>
        </button>
      </div>

      <p class="border-accented bg-default text-toned flex gap-3 rounded-2xl border p-4 text-sm shadow-sm">
        <UIcon
          name="i-lucide-info"
          class="text-muted mt-0.5 size-4 shrink-0"
        />
        <span>
          Overlaps resolve to the most specific rule: <b class="text-highlighted">equals</b> &gt;
          <b class="text-highlighted">starts/ends</b> &gt; <b class="text-highlighted">contains</b>, then longer, then older.
        </span>
      </p>

      <RuleGroup
        v-for="group in groups"
        :key="group.category.key"
        :group
        @delete="deleteRule"
      />

      <p
        v-if="groups.length === 0"
        class="text-muted py-8 text-center"
      >
        No rules match your search.
      </p>
    </div>
  </QueryBoundary>

  <div class="h-28" />
</template>
