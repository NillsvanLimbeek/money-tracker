import type { Db } from '../../db';
import { eq } from 'drizzle-orm';
import { transactions } from '../../db/schema';

export async function loadDescriptions(db: Db, userId: string): Promise<string[]> {
  const rows = await db
    .select({ description: transactions.description })
    .from(transactions)
    .where(eq(transactions.userId, userId));

  return rows.map(row => row.description);
}
