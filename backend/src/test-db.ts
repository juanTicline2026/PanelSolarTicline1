import { pool, initDatabase, isPostgresConnected } from './config/db.js';

async function testPostgresConnection() {
  console.log('====================================================');
  console.log('🔍 PROBANDO CONEXIÓN A POSTGRESQL Y CREANDO TABLAS...');
  console.log(`   Host:     ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto:   ${process.env.DB_PORT || '5432'}`);
  console.log(`   Usuario:  ${process.env.DB_USER || 'postgres'}`);
  console.log(`   Base BD:  ${process.env.DB_NAME || 'postgres'}`);
  console.log('====================================================\n');

  await initDatabase();

  if (!isPostgresConnected) {
    console.error('\n❌ No se pudo conectar a PostgreSQL.');
    console.error('Verifica que el servicio de PostgreSQL esté iniciado y que la contraseña en backend/.env sea correcta.');
    process.exit(1);
  }

  try {
    const versionRes = await pool.query('SELECT version(), current_database(), current_schema();');
    console.log('📌 Servidor:', versionRes.rows[0].version.split(',')[0]);
    console.log('📌 Base de datos activa:', versionRes.rows[0].current_database);
    console.log('📌 Esquema activo:', versionRes.rows[0].current_schema);

    const tablesRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(
      '\n📋 Tablas creadas en public:',
      tablesRes.rows.map((r) => r.table_name).join(', ')
    );

    const usersRes = await pool.query('SELECT id, email, nombre, rol, fecha_creacion FROM usuarios ORDER BY id;');
    console.log('\n👤 Usuarios listos para iniciar sesión en la plataforma:');
    console.table(usersRes.rows);

    console.log('\n🎉 ¡Todo listo! En HeidiSQL presiona F5 para ver las tablas "usuarios" y "cotizaciones" dentro del esquema "public".');
  } catch (err: any) {
    console.error('❌ Error consultando las tablas:', err.message);
  } finally {
    await pool.end();
  }
}

testPostgresConnection();

