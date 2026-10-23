import type { UseMutationReturnType } from '@tanstack/vue-query';
import type { ImportRow, ImportSummary } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { importTransactions } from './transactions.api';

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
