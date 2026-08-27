// migrate-likes.js — Migración de la tabla likes con user_id y restricción UNIQUE
// Uso: node migrate-likes.js

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

async function migrateLikes() {
  console.log('\n🔄  Actualizando esquema de la tabla `likes` en Turso...');

  try {
    // 1. Eliminar tabla anterior de likes
    console.log('🗑️   Recreando tabla likes...');
    await db.execute('DROP TABLE IF EXISTS likes;');

    // 2. Crear tabla likes con columnas post_id, user_id y restricción UNIQUE(post_id, user_id)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(post_id, user_id)
      );
    `);

    // 3. Crear índices para búsquedas rápidas
    await db.execute('CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);');

    console.log('✅  ¡Tabla `likes` actualizada exitosamente!');
    console.log('    Columnas: id, post_id, user_id, created_at');
    console.log('    Restricción: UNIQUE(post_id, user_id)\n');
  } catch (err) {
    console.error('❌  Error en la migración:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateLikes();
