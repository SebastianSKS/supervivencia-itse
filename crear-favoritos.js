// crear-favoritos.js — Crear tabla favorites en Turso (producción)
// Uso: node crear-favoritos.js

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

async function run() {
  console.log('\n🔄  Creando tabla `favorites` en Turso...');
  console.log('📡  Base de datos:', TURSO_DATABASE_URL);

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      );
    `);
    console.log('✅  Tabla `favorites` creada (o ya existía).');

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_favorites_post ON favorites(post_id);`);
    console.log('✅  Índices `idx_favorites_user` e `idx_favorites_post` creados.');

    console.log('\n🎉  ¡Listo! La tabla favorites ya existe en Turso.\n');
  } catch (err) {
    console.error('❌  Error al crear la tabla:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

run();
