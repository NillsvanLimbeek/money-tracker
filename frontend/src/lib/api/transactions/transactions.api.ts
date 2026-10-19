import type { ImportRow } from '../../types';
import { post } from '../fetch';

export interface ImportSummary {
  imported: number;
  skipped: number;
}

export async function importTransactions(rows: ImportRow[]): Promise<ImportSummary> {
  return await post('/api/transactions/import', rows);
}
