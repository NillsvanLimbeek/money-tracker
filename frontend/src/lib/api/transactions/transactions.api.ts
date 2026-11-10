import type { ApiTransaction, ImportRow, ImportSummary, Transaction } from '@/lib/types';
import { parseISO } from 'date-fns';
import { get, patch, post } from '../client/fetch';

/**
 * Fetches the user's transactions for one month.
 *
 * @param month - The month as `YYYY-MM`.
 * @returns The month's transactions, newest first, with amounts in euros.
 * @example
 * const transactions = await getTransactions('2026-10');
 */
export async function getTransactions(month: string): Promise<Transaction[]> {
  const rows = await get('/api/transactions', { month });

  return rows.map(row => ({
    id: row.id,
    date: parseISO(row.date),
    merchant: row.description,
    amount: row.amountCents / 100,
    categoryKey: row.category,
    notes: row.notes,
  }));
}

/**
 * Sets the category of one transaction.
 *
 * @param id - The transaction id.
 * @param categoryKey - The category key to assign.
 * @returns The updated transaction.
 * @example
 * await updateTransactionCategory('abc', 'food');
 */
export async function updateTransactionCategory(id: string, categoryKey: string): Promise<ApiTransaction> {
  return await patch(`/api/transactions/${id}`, { category: categoryKey });
}

/**
 * Imports parsed bank rows into the user's transactions.
 *
 * @param rows - The rows to import.
 * @returns How many rows were imported and how many were skipped,
 * and how many new debits no rule categorised.
 * @example
 * const { imported, skipped, uncategorised } = await importTransactions(rows);
 */
export async function importTransactions(rows: ImportRow[]): Promise<ImportSummary> {
  return await post('/api/transactions/import', rows);
}

/**
 * Fetches the import hashes already stored for the user, to flag duplicate rows.
 *
 * @param from - Start date as an ISO string (inclusive).
 * @param to - End date as an ISO string (inclusive).
 * @returns The import hashes stored between the two dates.
 * @example
 * const hashes = await getImportedHashes('2026-10-01', '2026-10-31');
 */
export async function getImportedHashes(from: string, to: string): Promise<string[]> {
  return await get('/api/transactions/hashes', { from, to });
}

/**
 * Fetches the months in which the user has imported transactions.
 *
 * @returns The months as `YYYY-MM`, oldest first.
 * @example
 * const months = await getImportedMonths(); // ['2026-09', '2026-10']
 */
export async function getImportedMonths(): Promise<string[]> {
  return await get('/api/transactions/months');
}
