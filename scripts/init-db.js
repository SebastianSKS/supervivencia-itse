// scripts/init-db.js
// Script de inicialización del esquema de base de datos para Supervivencia ITSE
// Uso: node scripts/init-db.js

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL y TURSO_AUTH_TOKEN son requeridos en .env.local');
    process.exit(1);
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('🚀 Inicializando base de datos Turso...\n');

  try {
    // ─── Tabla: users ─────────────────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        username     TEXT    NOT NULL UNIQUE,
        email        TEXT    NOT NULL UNIQUE,
        password_hash TEXT   NOT NULL,
        role         TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Tabla "users" creada correctamente.');

    // ─── Tabla: posts ─────────────────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Tabla "posts" creada correctamente.');

    // ─── Tabla: likes (anónimos) ───────────────────────────────────────────────
    await db.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Tabla "likes" creada correctamente (anónimos, sin user_id).');

    // ─── Índices para optimizar queries frecuentes ────────────────────────────
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)`);
    console.log('✅ Índices creados correctamente.');

    // ─── Usuario admin por defecto (opcional) ─────────────────────────────────
    // Se puede descomentar para crear un admin inicial
    // await db.execute(`
    //   INSERT OR IGNORE INTO users (username, email, password_hash, role)
    //   VALUES ('admin', 'admin@itse.edu.mx', '<hash>', 'admin')
    // `);

    console.log('\n🎉 ¡Base de datos inicializada exitosamente!');
    console.log('📊 Tablas creadas: users, posts, likes');
    console.log('📌 Turso URL:', process.env.TURSO_DATABASE_URL);
  } catch (error) {
    console.error('\n❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

initDatabase();
