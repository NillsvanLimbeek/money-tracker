import type { Db } from '../../db';
import { describe, expect, it } from 'vitest';
import { createRule } from '../category-rule-row/category-rule-row.fixture';
import { findChangedIds } from './find-changed-ids';

describe('findChangedIds', () => {
  // The query's `categorySource != 'manual'` filter runs in SQL, so it is not covered here.
  function dbReturning(rows: { id: string; description: string; category: string }[]): Db {
    return { select: () => ({ from: () => ({ where: async () => rows }) }) } as unknown as Db;
  }

  const food = createRule({ id: 'food-rule', pattern: 'albert', category: 'food' });

  it('returns transactions the rule wins that are not yet in its category', async () => {
    const db = dbReturning([
      { id: 't1', description: 'Albert Heijn 1', category: 'other' },
      { id: 't2', description: 'Albert Heijn 2', category: 'food' },
      { id: 't3', description: 'Netflix', category: 'other' },
    ]);

    expect(await findChangedIds(db, 'user-1', food, [food])).toEqual(['t1']);
  });

  it('skips transactions another, more specific rule wins', async () => {
    const specific = createRule({ id: 'specific', pattern: 'albert heijn', operator: 'equals', category: 'groceries' });
    const db = dbReturning([
      { id: 't1', description: 'Albert Heijn', category: 'other' },
      { id: 't2', description: 'Albert Cuyp market', category: 'other' },
    ]);

    expect(await findChangedIds(db, 'user-1', food, [food, specific])).toEqual(['t2']);
  });
});
