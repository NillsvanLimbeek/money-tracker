<script setup lang="ts">
import type { CategoryRule, RuleOperator } from '@/lib/types';
import { computed, ref } from 'vue';
import { useApplyCategoryRule, useCategoryRules, useCreateCategoryRule, useDeleteCategoryRule, useRulePreview, useUpdateCategoryRule } from '@/lib/api/category-rules/category-rules.queries';
import { CATEGORIES } from '@/lib/constants';
import { groupRulesByCategory } from '@/lib/utils';
import { m } from '@/paraglide/messages';

const rulesQuery = useCategoryRules();
const { mutate: deleteRule } = useDeleteCategoryRule();
const { mutateAsync: createRule } = useCreateCategoryRule();
const { mutateAsync: updateRule } = useUpdateCategoryRule();
const { mutateAsync: applyRule } = useApplyCategoryRule();
const toast = useToast();

const isFormOpen = ref(false);
const isSaving = ref(false);
const editingId = ref<string | undefined>();
const operator = ref<RuleOperator>('contains');
const pattern = ref('');
const categoryKey = ref<string | null>(null);

const preview = useRulePreview(pattern, operator);

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

function addRule(): void {
  editingId.value = undefined;
  operator.value = 'contains';
  pattern.value = '';
  categoryKey.value = null;
  isFormOpen.value = true;
}

function editRule(rule: CategoryRule): void {
  editingId.value = rule.id;
  operator.value = rule.operator;
  pattern.value = rule.pattern;
  categoryKey.value = rule.categoryKey;
  isFormOpen.value = true;
}

async function saveRule(shouldApply: boolean): Promise<void> {
  if (!categoryKey.value)
    return;

  isSaving.value = true;

  try {
    const draft = { pattern: pattern.value.trim(), operator: operator.value, category: categoryKey.value };
    const saved = editingId.value ? await updateRule({ id: editingId.value, changes: draft }) : await createRule(draft);
    const updated = shouldApply ? (await applyRule(saved.id)).updated : null;

    isFormOpen.value = false;
    toast.add({
      title: m.rule_saved_title(),
      description: updated === null ? undefined : m.transactions_updated({ count: updated }),
    });
  }
  catch {
    toast.add({ title: m.rule_save_failed(), description: m.common_try_again(), color: 'error' });
  }
  finally {
    isSaving.value = false;
  }
}
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
        {{ m.settings_title() }}
      </UButton>

      <UButton
        icon="i-lucide-plus"
        size="lg"
        @click="addRule"
      >
        {{ m.rules_add() }}
      </UButton>
    </div>
  </div>

  <PageHeader :title="m.rules_title()" />

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
        :placeholder="m.rules_search()"
      />

      <div class="-mx-4 flex gap-2 overflow-x-auto px-4">
        <button
          type="button"
          class="border-accented flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-medium"
          :class="{ 'border-primary bg-primary/10 text-primary': !selectedKey, 'bg-default text-highlighted': selectedKey }"
          @click="selectedKey = null"
        >
          {{ m.rules_all() }} <span class="font-mono text-sm opacity-70">{{ rules.length }}</span>
        </button>

        <Chip
          v-for="chip in chips"
          :key="chip.key"
          :chip
          :selected="selectedKey"
          @select="(e) => selectedKey = e"
        />
      </div>

      <p class="border-accented bg-default text-toned flex gap-3 rounded-2xl border p-4 text-sm shadow-sm">
        <UIcon
          name="i-lucide-info"
          class="text-muted mt-0.5 size-4 shrink-0"
        />
        <span>
          {{ m.rules_overlap_intro() }} <b class="text-highlighted">{{ m.rules_overlap_equals() }}</b> &gt;
          <b class="text-highlighted">{{ m.rules_overlap_starts_ends() }}</b> &gt; <b class="text-highlighted">{{ m.rules_overlap_contains() }}</b>{{ m.rules_overlap_tail() }}
        </span>
      </p>

      <RuleGroup
        v-for="group in groups"
        :key="group.category.key"
        :group
        @edit="editRule"
        @delete="deleteRule"
      />

      <p
        v-if="groups.length === 0"
        class="text-muted py-8 text-center"
      >
        {{ m.rules_none_match() }}
      </p>
    </div>
  </QueryBoundary>

  <RuleForm
    v-model:open="isFormOpen"
    v-model:operator="operator"
    v-model:pattern="pattern"
    v-model:category-key="categoryKey"
    :categories="CATEGORIES"
    :rules
    :preview="preview.data.value"
    :pending="isSaving"
    :editing-id
    @save="saveRule(false)"
    @save-and-apply="saveRule(true)"
  />

  <div class="h-28" />
</template>
