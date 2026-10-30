import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';
import { unstable_splitSqlQuery } from 'wrangler';

// Drizzle writes `drizzle/<name>/migration.sql`, which `readD1Migrations` does not understand.
const migrationsDir = join(import.meta.dirname, 'drizzle');
const migrations = readdirSync(migrationsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()
  .map(name => ({
    name,
    queries: unstable_splitSqlQuery(readFileSync(join(migrationsDir, name, 'migration.sql'), 'utf8')),
  }));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts'],
          exclude: ['src/**/*.d1.spec.ts'],
        },
      },
      {
        plugins: [
          cloudflareTest({
            wrangler: { configPath: './wrangler.toml' },
            miniflare: {
              // The workerd bundled with the pinned pool is older than the date in wrangler.toml.
              compatibilityDate: '2026-08-22',
              bindings: { TEST_MIGRATIONS: migrations },
            },
          }),
        ],
        test: {
          name: 'd1',
          include: ['src/**/*.d1.spec.ts'],
          setupFiles: ['./src/test/apply-migrations.ts'],
        },
      },
    ],
  },
});
