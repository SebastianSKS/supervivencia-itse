// migrate-social.js — Migración para crear tablas `follows` y `notifications`
// Uso: node migrate-social.js

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

async function migrateSocial() {
  console.log('\n🔄  Creando tablas `follows` y `notifications` en Turso...');

  try {
    // 1. Tabla follows
    await db.execute(`
      CREATE TABLE IF NOT EXISTS follows (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(follower_id, following_id)
      );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_follows_follower  ON follows(follower_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);');
    console.log('✅  Tabla `follows` creada con restricción UNIQUE(follower_id, following_id).');

    // 2. Tabla notifications
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       TEXT    NOT NULL CHECK (type IN ('like', 'follow')),
        post_id    INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        is_read    INTEGER NOT NULL DEFAULT 0,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      );
    `);
    await db.execute('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);');
    console.log('✅  Tabla `notifications` creada con soporte para types ("like", "follow") e is_read.');

    console.log('\n🎉  ¡Migración social completada exitosamente en Turso!\n');
  } catch (err) {
    console.error('❌  Error en la migración social:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateSocial();
