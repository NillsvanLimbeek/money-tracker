import type { Hyperdrive } from '@cloudflare/workers-types';

export interface Bindings {
  HYPERDRIVE: Hyperdrive;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
}
