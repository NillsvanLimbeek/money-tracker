import type { Hyperdrive } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export function createDb(hyperdrive: Hyperdrive) {
  const pool = new Pool({ connectionString: hyperdrive.connectionString });
  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof createDb>;
