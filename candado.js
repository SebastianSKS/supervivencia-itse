// candado.js — Script para crear el índice UNIQUE en la columna username de users
// Uso: node candado.js

const { createClient } = require('@libsql/client');
const { config }       = require('dotenv');
const path             = require('path');

// Cargar variables de entorno desde .env.local o .env
config({ path: path.resolve(__dirname, '.env.local') });
config({ path: path.resolve(__dirname, '.env') });

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Falta TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en tu archivo .env.local');
  process.exit(1);
}

const db = createClient({
  url:       TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function aplicarCandado() {
  console.log('\n🔒 Conectando a Turso para aplicar candado de unicidad...');
  console.log(`📡 URL: ${TURSO_DATABASE_URL}`);

  try {
    const sql = `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);`;
    await db.execute(sql);

    console.log('\n✅ Candado aplicado con éxito:');
    console.log(`   SQL: "${sql}"`);
    console.log('🛡️  A partir de ahora, la base de datos rechazará automáticamente cualquier intento de duplicar usernames.\n');
  } catch (err) {
    console.error('\n❌ Error al aplicar el índice UNIQUE:', err.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

aplicarCandado();
