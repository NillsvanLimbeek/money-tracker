import type { Db } from './db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from './db/schema';

// Scaffolding only for now — the frontend still authenticates directly
// against Neon Auth (frontend/src/lib/neon.ts, frontend/src/stores/auth.ts
// are intentionally untouched). Nothing here is called by the frontend yet;
// wiring the frontend over to this API is a follow-up.
export function createAuth(db: Db, options: {
  secret: string;
  baseURL: string;
  trustedOrigin: string;
}) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
    }),
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: [options.trustedOrigin],
    emailAndPassword: {
      enabled: true,
    },
  });
}
