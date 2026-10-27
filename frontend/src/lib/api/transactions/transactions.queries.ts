import type { UseMutationReturnType, UseQueryReturnType } from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type { ImportRow, ImportSummary, Transaction } from '../../types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { toValue } from 'vue';
import { getTransactions, importTransactions, updateTransactionCategory } from './transactions.api';

/**
 * Query for the user's transactions in one month.
 *
 * @param month - The month as `YYYY-MM`, may be reactive.
 * @returns The TanStack query result for that month's transactions.
 * @example
 * const { data, isLoading } = useTransactions(() => format(selectedMonth.value, 'yyyy-MM'));
 */
export function useTransactions(month: MaybeRefOrGetter<string>): UseQueryReturnType<Transaction[], Error> {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: () => getTransactions(toValue(month)),
  });
}

/**
 * Mutation that sets a transaction's category and refreshes the cached transactions.
 *
 * @returns The TanStack mutation for changing a category.
 * @example
 * const { mutate } = useUpdateTransactionCategory();
 * mutate({ id: 'abc', categoryKey: 'food' });
 */
export function useUpdateTransactionCategory(): UseMutationReturnType<unknown, Error, { id: string; categoryKey: string }, unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, categoryKey }: { id: string; categoryKey: string }) => updateTransactionCategory(id, categoryKey),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

/**
 * Mutation that imports rows and invalidates the cached transactions on success.
 *
 * @returns The TanStack mutation for importing transactions.
 * @example
 * const { mutateAsync, isPending } = useImportTransactions();
 * const summary = await mutateAsync(rows);
 */
export function useImportTransactions(): UseMutationReturnType<ImportSummary, Error, ImportRow[], unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: ImportRow[]) => importTransactions(rows),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}
