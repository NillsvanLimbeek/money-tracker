import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'drizzle-kit';

const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';
const dbFile = readdirSync(d1Dir).find((file) => file.endsWith('.sqlite') && file !== 'metadata.sqlite');

if (!dbFile) {
  throw new Error(`No local D1 database found in ${d1Dir}. Run "npm run db:migrate:local" first.`);
}

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: { url: join(d1Dir, dbFile) },
});
