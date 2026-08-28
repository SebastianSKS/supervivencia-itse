// migrate-views.js — Agregar columna `views` a la tabla `posts`
// Uso: node migrate-views.js

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

async function migrateViews() {
  console.log('\n🔄  Agregando columna `views` a la tabla `posts` en Turso...');

  try {
    // Intentar agregar la columna views a la tabla posts
    await db.execute('ALTER TABLE posts ADD COLUMN views INTEGER DEFAULT 0;');
    console.log('✅  Columna `views` agregada exitosamente a la tabla `posts`.');
  } catch (err) {
    if (err.message.includes('duplicate column') || err.message.includes('already exists')) {
      console.log('ℹ️  La columna `views` ya existía en la tabla `posts`.');
    } else {
      console.error('❌  Error al modificar la tabla:', err.message);
      process.exit(1);
    }
  } finally {
    db.close();
  }
}

migrateViews();
