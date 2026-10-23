import type { ImportRow, ImportSummary } from '../../types';
import { get, post } from '../client/fetch';

/**
 * Imports parsed bank rows into the user's transactions.
 *
 * @param rows - The rows to import.
 * @returns How many rows were imported and how many were skipped.
 * @example
 * const { imported, skipped } = await importTransactions(rows);
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
