import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL is not defined in environment variables');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN is not defined in environment variables');
}

// Singleton pattern: reutiliza la instancia durante el ciclo de vida del servidor
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createClient> | undefined;
};

export const db =
  globalForDb.db ??
  createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
