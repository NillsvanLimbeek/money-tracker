import type { UseMutationReturnType, UseQueryReturnType } from '@tanstack/vue-query';
import type { CategoryRule } from '../../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { deleteCategoryRule, getCategoryRules } from './category-rules.api';

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
