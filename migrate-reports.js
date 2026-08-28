// migrate-reports.js — Migración para crear la tabla `reports`
// Uso: node migrate-reports.js

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

async function migrateReports() {
  console.log('\n🔄  Creando tabla `reports` en Turso...');

  try {
    // 1. Crear tabla reports con llaves foráneas y restricción UNIQUE(post_id, user_id)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason     TEXT    NOT NULL,
        created_at TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE(post_id, user_id)
      );
    `);

    // 2. Crear índices para optimizar consultas de moderación
    await db.execute('CREATE INDEX IF NOT EXISTS idx_reports_post_id ON reports(post_id);');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);');

    console.log('✅  ¡Tabla `reports` creada exitosamente en Turso!');
    console.log('    Columnas: id, post_id, user_id, reason, created_at');
    console.log('    Restricción: UNIQUE(post_id, user_id)\n');
  } catch (err) {
    console.error('❌  Error en la migración:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateReports();
