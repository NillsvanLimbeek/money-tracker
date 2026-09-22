import type { Db } from './db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from './db/schema';

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
