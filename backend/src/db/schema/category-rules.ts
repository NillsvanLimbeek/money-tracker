import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

export const categoryRules = sqliteTable('category_rules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  keyword: text('keyword').notNull(),
  category: text('category').notNull(),
  priority: integer('priority').notNull(),
}, table => [
  index('category_rules_user_id_idx').on(table.userId),
]);
