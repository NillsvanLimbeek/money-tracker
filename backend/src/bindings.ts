export interface Bindings {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  CORS_ORIGIN: string;
}

export interface Variables {
  userId: string;
}

export interface AppEnv {
  Bindings: Bindings;
  Variables: Variables;
}
