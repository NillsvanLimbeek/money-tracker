import type { ImportRow, Transaction } from '@/lib/types';
import { parseISO } from 'date-fns';

/**
 * Converts a parsed bank row into a `Transaction` so the review screen can reuse the transaction row.
 *
 * The category mirrors the placeholder the import route stores until keyword categorisation lands.
 *
 * @param row - A row parsed from the bank CSV.
 * @returns A transaction with the row's import hash as its id and the amount in euros.
 * @example
 * importRowToTransaction({ date: '2026-10-16', description: 'AH', amountCents: -4320, importHash: 'h', ... });
 * // { id: 'h', date: Date(2026-10-16), merchant: 'AH', amount: -43.2, categoryKey: 'other', notes: null }
 */
export function importRowToTransaction(row: ImportRow): Transaction {
  return {
    id: row.importHash,
    date: parseISO(row.date),
    merchant: row.description,
    amount: row.amountCents / 100,
    categoryKey: row.amountCents > 0 ? 'income' : 'other',
    notes: row.notes,
  };
}
