// asegurar-restricciones.js — Aplica restricciones UNIQUE y crea tabla reports si no existe
// Uso: node asegurar-restricciones.js

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

const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

async function run() {
  console.log('\n🔄  Aplicando restricciones a Turso...');

  // Tabla reports (por si no existe)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL DEFAULT 'Contenido inapropiado',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    );
  `);
  console.log('✅  Tabla reports asegurada.');

  // Índice único en reports (si fue creada sin UNIQUE en la constraint, lo añadimos via index)
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_unique ON reports(post_id, user_id);`);
  console.log('✅  Índice UNIQUE idx_reports_unique aplicado.');

  // Tabla favorites (por si no existe aún en producción)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id)
    );
  `);
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique ON favorites(user_id, post_id);`);
  console.log('✅  Tabla favorites y su índice UNIQUE asegurados.');

  console.log('\n🎉  ¡Listo! Todas las restricciones están en su lugar.\n');
  db.close();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
