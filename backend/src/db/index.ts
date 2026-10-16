import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { drizzle } from 'drizzle-orm/d1';
import { relations } from './relations';

export type Db = DrizzleD1Database<typeof relations>;

export function createDb(d1: D1Database): Db {
  return drizzle(d1, { relations });
}
