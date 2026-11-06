<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryDrawer from '@/components/category-drawer/CategoryDrawer.vue';
import MonthSummary from '@/components/month-summary/MonthSummary.vue';
import QueryBoundary from '@/components/query-boundary/QueryBoundary.vue';
import RulePromptDrawer from '@/components/rule-prompt-drawer/RulePromptDrawer.vue';
import TransactionList from '@/components/transaction-list/TransactionList.vue';
import { useApplyCategoryRule, useCategoryRules, useCreateCategoryRule, useRulePreview } from '@/lib/api/category-rules/category-rules.queries';
import { useTransactions, useUpdateTransactionCategory } from '@/lib/api/transactions/transactions.queries';
import { CATEGORIES } from '@/lib/constants';
import { categoryIsSelected, filterTransactions } from '@/lib/utils';
import { m } from '@/paraglide/messages';

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
    toast.add({ title: m.rule_created_title(), description: m.transactions_updated({ count: updated }) });
  }
  catch {
    toast.add({ title: m.rule_create_failed(), description: m.common_try_again(), color: 'error' });
  }
}

const search = ref('');
const isFilterOpen = ref(false);
const route = useRoute();
const router = useRouter();

// The selected categories live in the URL (`?category=food,other`) so other screens can link to a filtered ledger.
const selectedCategories = computed<string[]>({
  get() {
    const raw = [route.query.category].flat().join(',');
    return raw
      .split(',')
      .filter(key => CATEGORIES.some(category => category.key === key));
  },
  set(keys) {
    const { category: _category, ...rest } = route.query;
    router.replace({ query: keys.length > 0 ? { ...rest, category: keys.join(',') } : rest });
  },
});

const filteredTransactions = computed(() => filterTransactions(transactions.value, {
  search: search.value,
  categories: selectedCategories.value,
}));

const selectedCategoryItems = computed(() => CATEGORIES.filter(category => selectedCategories.value.includes(category.key)));

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
    <PageHeader :title="m.transactions_title()" />

    <div class="border-accented flex w-full gap-4 border-b px-4 pb-4">
      <UInput
        v-model="search"
        class="w-full"
        size="lg"
        icon="i-lucide-search"
        :placeholder="m.transactions_search()"
      >
        <template
          v-if="search"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-x"
            :aria-label="m.transactions_search_clear()"
            @click="search = ''"
          />
        </template>
      </UInput>

      <CategoryDrawer
        v-model:open="isFilterOpen"
        :categories="CATEGORIES"
        :selected-categories
        @toggle-category="toggleCategory"
        @reset-categories="resetCategories"
      />
    </div>

    <SearchFilterSelection
      :selected-categories
      :selected-category-items
      :transactions
      :filtered-transactions
      @clear="resetCategories"
    />
  </div>

  <MonthSummary
    v-model="selectedMonth"
    :income="income"
    :expense="expense"
  />

  <QueryBoundary :query="transactionsQuery">
    <template #default>
      <p
        v-if="filteredTransactions.length === 0"
        class="text-muted px-4 pt-16 text-center"
      >
        {{ m.transactions_empty() }}
      </p>

      <TransactionList
        v-else
        :transactions="filteredTransactions"
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
