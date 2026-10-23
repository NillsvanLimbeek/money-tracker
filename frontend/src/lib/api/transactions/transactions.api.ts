import type { ImportRow } from '../../types';
import { get, post } from '../fetch';

export interface ImportSummary {
  imported: number;
  skipped: number;
}

export async function importTransactions(rows: ImportRow[]): Promise<ImportSummary> {
  return await post('/api/transactions/import', rows);
}

// Import hashes already stored for the user between two ISO dates (inclusive).
export async function getImportedHashes(from: string, to: string): Promise<string[]> {
  return await get('/api/transactions/hashes', { from, to });
}
