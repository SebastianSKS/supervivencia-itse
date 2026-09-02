// agregar-categoria.js — Añade la columna 'category' a la tabla 'posts'
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
  console.log('\n🔄 Añadiendo columna category a la tabla posts...');
  
  try {
    await db.execute(`ALTER TABLE posts ADD COLUMN category TEXT DEFAULT NULL;`);
    console.log('✅  Columna category añadida exitosamente.');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅  La columna category ya existe. No se hicieron cambios.');
    } else {
      console.error('❌ Error al alterar la tabla:', err.message);
      process.exit(1);
    }
  }

  db.close();
}

run();
