// migrate-favorites.js — Crear tabla `favorites` en Turso
// Uso: node migrate-favorites.js

const { createClient } = require('@libsql/client');
const { config }       = require('dotenv');
const path             = require('path');

config({ path: path.resolve(__dirname, '.env.local') });
config({ path: path.resolve(__dirname, '.env') });

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Falta TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env.local');
  process.exit(1);
}

const db = createClient({
  url:       TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function migrateFavorites() {
  console.log('\n🔄  Creando tabla `favorites` e índices en Turso...');

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, post_id)
      );
    `);
    console.log('✅  Tabla `favorites` creada exitosamente.');

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_post ON favorites(post_id);`);
    console.log('✅  Índices para `favorites` creados exitosamente.');
  } catch (err) {
    console.error('❌  Error en la migración de favoritos:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateFavorites();
