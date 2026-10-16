import type { Auth, BetterAuthOptions } from 'better-auth';
import type { Db } from './db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from './db/schema/auth';

export function createAuth(db: Db, options: {
  secret: string;
  baseURL: string;
  trustedOrigin: string;
}): Auth {
  const config: BetterAuthOptions = {
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
    }),
    secret: options.secret,
    baseURL: options.baseURL,
    trustedOrigins: [options.trustedOrigin],
    emailAndPassword: {
      enabled: true,
    },
  };

  return betterAuth(config);
}
