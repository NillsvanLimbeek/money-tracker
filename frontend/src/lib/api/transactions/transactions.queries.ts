import type { UseMutationReturnType } from '@tanstack/vue-query';
import type { ImportRow } from '../../types';
import type { ImportSummary } from './transactions.api';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { importTransactions } from './transactions.api';

export function useImportTransactions(): UseMutationReturnType<ImportSummary, Error, ImportRow[], unknown> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: ImportRow[]) => importTransactions(rows),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}
