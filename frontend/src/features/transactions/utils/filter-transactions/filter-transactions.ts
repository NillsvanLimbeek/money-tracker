import type { TransactionFilters } from '@/features/transactions/types';
import type { Transaction } from '@/lib/types';
import Fuse from 'fuse.js';

/**
 * Filters transactions by category and a fuzzy search on description and notes.
 *
 * An empty category list or a blank search does not filter. With a search, the
 * best matches come first.
 *
 * @param transactions - The transactions to filter.
 * @param filters - The search text and the selected category keys.
 * @param filters.search - Fuzzy text matched against description and notes.
 * @param filters.categories - Category keys to keep; empty keeps all.
 * @returns The transactions that pass both filters.
 * @example
 * filterTransactions(transactions, { search: 'albert', categories: ['food'] });
 */
export function filterTransactions(transactions: Transaction[], { search, categories }: TransactionFilters): Transaction[] {
  const inCategories = categories.length === 0
    ? transactions
    : transactions.filter(t => categories.includes(t.categoryKey));
  const query = search.trim();

  if (!query)
    return inCategories;

  const fuse = new Fuse(inCategories, {
    keys: ['merchant', 'notes'],
    threshold: 0.3,
    ignoreLocation: true,
  });

  return fuse.search(query).map(result => result.item);
}
