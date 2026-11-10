import type { UseMutationReturnType, UseQueryReturnType } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type { CategoryRule, NewCategoryRule, RuleOperator, RulePreview } from '../../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { toValue } from 'vue';
import { addSuggestedRules, applyCategoryRule, createCategoryRule, deleteCategoryRule, getCategoryRules, previewCategoryRule, updateCategoryRule } from './category-rules.api';

/**
 * Query for the user's category rules.
 *
 * @returns The TanStack query result for the rules.
 * @example
 * const { data, isLoading } = useCategoryRules();
 */
export function useCategoryRules(): UseQueryReturnType<CategoryRule[], Error> {
  return useQuery({
    queryKey: ['category-rules'],
    queryFn: getCategoryRules,
  });
}

/**
 * Mutation that deletes a rule and refreshes the cached rules.
 *
 * @returns The TanStack mutation for deleting a rule.
 * @example
 * const { mutate } = useDeleteCategoryRule();
 * mutate('abc');
 */
export function useDeleteCategoryRule(): UseMutationReturnType<void, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-rules'] }),
  });
}

/**
 * Mutation that creates a rule and refreshes the cached rules.
 *
 * @returns The TanStack mutation for creating a rule.
 * @example
 * const { mutateAsync } = useCreateCategoryRule();
 * const rule = await mutateAsync({ pattern: 'ziggo', operator: 'contains', category: 'housing' });
 */
export function useCreateCategoryRule(): UseMutationReturnType<CategoryRule, Error, NewCategoryRule, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rule: NewCategoryRule) => createCategoryRule(rule),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-rules'] }),
  });
}

/**
 * Mutation that updates a rule and refreshes the cached rules.
 *
 * @returns The TanStack mutation for updating a rule.
 * @example
 * const { mutateAsync } = useUpdateCategoryRule();
 * const rule = await mutateAsync({ id: 'abc', changes: { category: 'food' } });
 */
export function useUpdateCategoryRule(): UseMutationReturnType<CategoryRule, Error, { id: string; changes: Partial<NewCategoryRule> }, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Partial<NewCategoryRule> }) => updateCategoryRule(id, changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['category-rules'] }),
  });
}

/**
 * Mutation that applies a rule to existing transactions and refreshes the cached rules and transactions.
 *
 * @returns The TanStack mutation for applying a rule.
 * @example
 * const { mutateAsync } = useApplyCategoryRule();
 * const { updated } = await mutateAsync('abc');
 */
export function useApplyCategoryRule(): UseMutationReturnType<{ updated: number }, Error, string, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applyCategoryRule(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['category-rules'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    ]),
  });
}

/**
 * Query for what an unsaved rule would match. Stays idle while the pattern is blank.
 *
 * @param pattern - The pattern, may be reactive.
 * @param operator - The operator, may be reactive.
 * @returns The TanStack query result for the preview.
 * @example
 * const preview = useRulePreview(() => form.pattern, () => form.operator);
 */
export function useRulePreview(pattern: MaybeRefOrGetter<string>, operator: MaybeRefOrGetter<RuleOperator>): UseQueryReturnType<RulePreview, Error> {
  return useQuery({
    queryKey: ['category-rules', 'preview', pattern, operator],
    queryFn: () => previewCategoryRule(toValue(pattern).trim(), toValue(operator)),
    enabled: () => toValue(pattern).trim() !== '',
    placeholderData: previous => previous,
  });
}

/**
 * Mutation that adds the suggested starter rules and refreshes the cached rules and transactions.
 *
 * @returns The TanStack mutation for adding the suggested rules.
 * @example
 * const { mutateAsync } = useAddSuggestedRules();
 * const { created, updated } = await mutateAsync();
 */
export function useAddSuggestedRules(): UseMutationReturnType<{ created: number; updated: number }, Error, void, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => addSuggestedRules(),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: ['category-rules'] }),
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    ]),
  });
}
