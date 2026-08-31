// migrate.js — Script de migración para Supervivencia ITSE
// Uso: node migrate.js
//
// Antes de correr: asegúrate de tener TURSO_AUTH_TOKEN en tu .env.local

const { createClient } = require('@libsql/client');
const { config }       = require('dotenv');
const path             = require('path');

// Carga .env.local desde la raíz del proyecto
config({ path: path.resolve(__dirname, '.env.local') });

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

// ── Validación de variables ───────────────────────────────────────────────────
if (!TURSO_DATABASE_URL) {
  console.error('❌  Falta TURSO_DATABASE_URL en .env.local');
  process.exit(1);
}
if (!TURSO_AUTH_TOKEN) {
  console.error('❌  Falta TURSO_AUTH_TOKEN en .env.local');
  console.error('    Genera uno con: turso db tokens create error-404-sebastiansks');
  process.exit(1);
}

// ── Cliente Turso ─────────────────────────────────────────────────────────────
const db = createClient({
  url:       TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// ── Sentencias SQL ────────────────────────────────────────────────────────────
const migrations = [
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        username      TEXT    NOT NULL UNIQUE,
        email         TEXT    NOT NULL UNIQUE,
        password_hash TEXT    NOT NULL,
        role          TEXT    NOT NULL DEFAULT 'user'
                              CHECK (role IN ('user', 'admin')),
        created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `,
  },
  {
    name: 'posts',
    sql: `
      CREATE TABLE IF NOT EXISTS posts (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL
                   REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        views      INTEGER NOT NULL DEFAULT 0,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `,
  },
  {
    name: 'likes',
    sql: `
      CREATE TABLE IF NOT EXISTS likes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id    INTEGER NOT NULL
                   REFERENCES posts(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL
                   REFERENCES users(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(post_id, user_id)
      )
    `,
  },
  {
    name: 'reports',
    sql: `
      CREATE TABLE IF NOT EXISTS reports (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id    INTEGER NOT NULL
                   REFERENCES posts(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL
                   REFERENCES users(id) ON DELETE CASCADE,
        reason     TEXT    NOT NULL,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(post_id, user_id)
      )
    `,
  },
  {
    name: 'follows',
    sql: `
      CREATE TABLE IF NOT EXISTS follows (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(follower_id, following_id)
      )
    `,
  },
  {
    name: 'notifications',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       TEXT    NOT NULL CHECK (type IN ('like', 'follow')),
        post_id    INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        is_read    INTEGER NOT NULL DEFAULT 0,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `,
  },
  {
    name: 'favorites',
    sql: `
      CREATE TABLE IF NOT EXISTS favorites (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, post_id)
      )
    `,
  },
  {
    name: 'index: posts.user_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_posts_user_id   ON posts(user_id)`,
  },
  {
    name: 'index: posts.created_at',
    sql: `CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)`,
  },
  {
    name: 'index: likes.post_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_likes_post_id   ON likes(post_id)`,
  },
  {
    name: 'index: reports.post_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_reports_post_id ON reports(post_id)`,
  },
  {
    name: 'index: reports.user_id',
    sql: `CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id)`,
  },
  {
    name: 'index: follows.follower',
    sql: `CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id)`,
  },
  {
    name: 'index: follows.following',
    sql: `CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id)`,
  },
  {
    name: 'index: notifications.user',
    sql: `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read)`,
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────
async function migrate() {
  console.log('\n🚀  Conectando a Turso...');
  console.log('    URL:', TURSO_DATABASE_URL, '\n');

  for (const { name, sql } of migrations) {
    try {
      await db.execute(sql);
      console.log(`✅  ${name}`);
    } catch (err) {
      console.error(`❌  Error en "${name}":`, err.message);
      db.close();
      process.exit(1);
    }
  }

  console.log('\n🎉  ¡Migración completada! Tablas listas en Turso.');
  console.log('    users  →  posts  →  likes\n');
  db.close();
}

migrate();
