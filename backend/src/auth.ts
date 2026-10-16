import type { Auth, BetterAuthOptions } from 'better-auth';
import type { Bindings } from './bindings';
import type { Db } from './db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createDb } from './db';
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

export function getAuth(c: { env: Bindings; req: { url: string } }): Auth {
  return createAuth(createDb(c.env.DB), {
    secret: c.env.BETTER_AUTH_SECRET,
    baseURL: new URL(c.req.url).origin,
    trustedOrigin: c.env.CORS_ORIGIN,
  });
}
