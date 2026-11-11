import { pool, initDatabase, isPostgresConnected } from './config/db.js';

async function testPostgresConnection() {
  console.log('====================================================');
  console.log('🔒 ENCRIPTANDO CONTRASEÑAS EN POSTGRESQL (SCRYPT + SALT)...');
  console.log('====================================================\n');

  await initDatabase();

  if (!isPostgresConnected) {
    console.error('\n❌ No se pudo conectar a PostgreSQL.');
    process.exit(1);
  }

  try {
    const usersRes = await pool.query(`
      SELECT
        id,
        email,
        nombre,
        LEFT(password_hash, 42) || '...' AS password_hash_encriptado
      FROM public.usuarios
      ORDER BY id;
    `);
    console.log('👤 Usuarios con contraseña encriptada irreversible en public.usuarios:');
    console.table(usersRes.rows);
  } catch (err: any) {
    console.error('❌ Error consultando las tablas:', err.message);
  } finally {
    await pool.end();
  }
}

testPostgresConnection();
