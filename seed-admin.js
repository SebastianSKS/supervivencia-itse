// seed-admin.js — Script para crear el usuario Administrador por defecto
// Uso: node seed-admin.js

const { createClient } = require('@libsql/client');
const bcrypt           = require('bcryptjs');
const { config }       = require('dotenv');
const path             = require('path');

// Carga las variables de entorno desde .env.local (o .env como fallback)
config({ path: path.resolve(__dirname, '.env.local') });
config({ path: path.resolve(__dirname, '.env') });

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

// ── Validación de variables ───────────────────────────────────────────────────
if (!TURSO_DATABASE_URL) {
  console.error('❌ Error: Falta TURSO_DATABASE_URL en tus variables de entorno.');
  process.exit(1);
}
if (!TURSO_AUTH_TOKEN) {
  console.error('❌ Error: Falta TURSO_AUTH_TOKEN en tus variables de entorno.');
  process.exit(1);
}

// ── Cliente Turso ─────────────────────────────────────────────────────────────
const db = createClient({
  url:       TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// ── Datos del Administrador ───────────────────────────────────────────────────
const ADMIN_DATA = {
  username: 'AdminGeneral',
  email:    'admin@itse.com',
  password: 'Supervivencia2026!',
  role:     'admin',
};

async function seedAdmin() {
  console.log('\n👑  Iniciando creación de usuario Administrador...');
  console.log(`    Base de datos: ${TURSO_DATABASE_URL}`);
  console.log(`    Admin email:   ${ADMIN_DATA.email}`);
  console.log(`    Admin user:    ${ADMIN_DATA.username}`);

  try {
    // 1. Validar si ya existe el correo o el username
    const existing = await db.execute({
      sql: 'SELECT id, username, email, role FROM users WHERE email = ? OR username = ? LIMIT 1',
      args: [ADMIN_DATA.email, ADMIN_DATA.username],
    });

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      console.log('\n⚠️  El usuario administrador ya existe en la base de datos:');
      console.log(`    ID:       #${user.id}`);
      console.log(`    Username: @${user.username}`);
      console.log(`    Email:    ${user.email}`);
      console.log(`    Rol:      ${user.role}`);
      console.log('\n✨  No se realizaron cambios para evitar duplicados.\n');
      db.close();
      return;
    }

    // 2. Hashear la contraseña de forma segura
    console.log('\n🔒  Hasheando contraseña con bcryptjs...');
    const password_hash = await bcrypt.hash(ADMIN_DATA.password, 12);

    // 3. Insertar el usuario con rol 'admin'
    console.log('📝  Insertando registro en la tabla users con role = "admin"...');
    const result = await db.execute({
      sql: `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      args: [ADMIN_DATA.username, ADMIN_DATA.email, password_hash, ADMIN_DATA.role],
    });

    const newId = Number(result.lastInsertRowid);

    console.log('\n✅  ¡Usuario Administrador creado exitosamente!');
    console.log('──────────────────────────────────────────────────');
    console.log(`    ID:          #${newId}`);
    console.log(`    Username:    @${ADMIN_DATA.username}`);
    console.log(`    Email:       ${ADMIN_DATA.email}`);
    console.log(`    Contraseña:  ${ADMIN_DATA.password}`);
    console.log(`    Rol:         ${ADMIN_DATA.role}`);
    console.log('──────────────────────────────────────────────────');
    console.log('🚀  Ya puedes iniciar sesión en /login y acceder a /admin\n');

  } catch (error) {
    console.error('\n❌  Error al crear el usuario administrador:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

seedAdmin();
