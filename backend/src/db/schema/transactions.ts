import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  description: text('description').notNull(),
  amountCents: integer('amount_cents').notNull(),
  category: text('category').notNull(),
  rawCounterparty: text('raw_counterparty'),
  mutationType: text('mutation_type'),
  notes: text('notes'),
  importHash: text('import_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, table => [
  uniqueIndex('transactions_user_id_import_hash_unique').on(table.userId, table.importHash),
  index('transactions_user_id_date_idx').on(table.userId, table.date),
]);
