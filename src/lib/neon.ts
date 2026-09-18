import { createClient } from '@neondatabase/neon-js';

export const neon = createClient(import.meta.env.VITE_NEON_DATABASE_URL);
