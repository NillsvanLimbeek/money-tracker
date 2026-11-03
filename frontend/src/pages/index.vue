<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import CategoryDrawer from '@/components/category-drawer/CategoryDrawer.vue';
import MonthSummary from '@/components/month-summary/MonthSummary.vue';
import QueryBoundary from '@/components/query-boundary/QueryBoundary.vue';
import RulePromptDrawer from '@/components/rule-prompt-drawer/RulePromptDrawer.vue';
import TransactionList from '@/components/transaction-list/TransactionList.vue';
import { useApplyCategoryRule, useCategoryRules, useCreateCategoryRule, useRulePreview } from '@/lib/api/category-rules/category-rules.queries';
import { useTransactions, useUpdateTransactionCategory } from '@/lib/api/transactions/transactions.queries';
import { CATEGORIES } from '@/lib/constants';
import { categoryIsSelected } from '@/lib/utils';

const now = new Date();
const selectedMonth = ref(new Date(now.getFullYear(), now.getMonth(), 1));

const transactionsQuery = useTransactions(() => format(selectedMonth.value, 'yyyy-MM'));
const { mutate: updateCategory } = useUpdateTransactionCategory();

const transactions = computed(() => transactionsQuery.data.value ?? []);

const income = computed(() => transactions.value
  .filter(t => t.amount > 0)
  .reduce((sum, t) => sum + t.amount, 0));
const expense = computed(() => transactions.value
  .filter(t => t.amount < 0)
  .reduce((sum, t) => sum - t.amount, 0));

const toast = useToast();
const rulesQuery = useCategoryRules();
const { mutateAsync: createRule, isPending: isCreatingRule } = useCreateCategoryRule();
const { mutateAsync: applyRule } = useApplyCategoryRule();

const isRulePromptOpen = ref(false);
const promptCategoryKey = ref<string | null>(null);
const promptPattern = ref('');

const promptCategory = computed(() => CATEGORIES.find(category => category.key === promptCategoryKey.value));
const promptPreview = useRulePreview(promptPattern, () => 'contains');

// Offers a rule for the description, unless the new category is just a fallback.
function changeCategory(payload: { id: string; categoryKey: string }): void {
  const transaction = transactions.value.find(item => item.id === payload.id);

  updateCategory(payload, {
    onSuccess: () => {
      if (!transaction || payload.categoryKey === 'other')
        return;

      promptCategoryKey.value = payload.categoryKey;
      promptPattern.value = transaction.merchant;
      isRulePromptOpen.value = true;
    },
  });
}

async function createPromptedRule(): Promise<void> {
  if (!promptCategoryKey.value)
    return;

  try {
    const rule = await createRule({ pattern: promptPattern.value.trim(), operator: 'contains', category: promptCategoryKey.value });
    const { updated } = await applyRule(rule.id);

    isRulePromptOpen.value = false;
    toast.add({ title: 'Rule created', description: `${updated} ${updated === 1 ? 'transaction' : 'transactions'} updated` });
  }
  catch {
    toast.add({ title: 'Could not create the rule', description: 'Try again in a moment.', color: 'error' });
  }
}

const search = ref('');
const isFilterOpen = ref(false);
const selectedCategories = ref<string[]>([]);

function toggleCategory(key: string): void {
  selectedCategories.value = categoryIsSelected(selectedCategories.value, key)
    ? selectedCategories.value.filter(k => k !== key)
    : [...selectedCategories.value, key];
}

function resetCategories(): void {
  selectedCategories.value = [];
}
</script>

<template>
  <div class="bg-olive-50 sticky top-0 z-10">
    <PageHeader title="Transactions" />

    <div class="border-accented flex w-full gap-4 border-b px-4 pb-4">
      <UInput
        v-model="search"
        class="w-full"
        size="lg"
        icon="i-lucide-search"
        placeholder="Search Transactions"
      />

      <CategoryDrawer
        v-model:open="isFilterOpen"
        :categories="CATEGORIES"
        :selected-categories
        @toggle-category="toggleCategory"
        @reset-categories="resetCategories"
      />
    </div>
  </div>

  <MonthSummary
    v-model="selectedMonth"
    :income="income"
    :expense="expense"
  />

  <QueryBoundary :query="transactionsQuery">
    <template #default="{ data }">
      <TransactionList
        :transactions="data"
        :categories="CATEGORIES"
        @change-category="changeCategory"
      />
    </template>
  </QueryBoundary>

  <RulePromptDrawer
    v-if="promptCategory"
    v-model:open="isRulePromptOpen"
    v-model:pattern="promptPattern"
    :category="promptCategory"
    :rules="rulesQuery.data.value ?? []"
    :preview="promptPreview.data.value"
    :pending="isCreatingRule"
    @create="createPromptedRule"
  />

  <div class="h-28" />
</template>
