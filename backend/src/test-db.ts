import { pool, initDatabase, isPostgresConnected } from './config/db.js';

interface LoginTestResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    nombre: string;
    rol: string;
  };
  message?: string;
}

async function testPostgresConnection() {
  console.log('====================================================');
  console.log('🔍 VERIFICANDO USUARIOS Y TOKENS JWT EN POSTGRESQL...');
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
        rol,
        LEFT(password_hash, 32) || '...' AS password_hash_encriptado,
        LEFT(token_jwt, 36) || '...' AS token_jwt_en_bd,
        ultimo_login
      FROM public.usuarios
      ORDER BY id;
    `);
    console.log('👤 Usuarios y sus Tokens JWT en public.usuarios:');
    console.table(usersRes.rows);

    // Probar login en vivo contra http://localhost:4000/api/auth/login consultando el token en BD
    const loginRes = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jrendonrios120@gmail.com', password: '1022' }),
    });
    const loginData = (await loginRes.json()) as LoginTestResponse;
    console.log('\n✅ Prueba de Login (POST /api/auth/login con jrendonrios120@gmail.com):', loginRes.status);
    console.log({
      user: loginData.user,
      token_consultado_bd: loginData.token ? String(loginData.token).slice(0, 45) + '...' : null,
    });

    if (loginData.token) {
      const meRes = await fetch('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      const meData = (await meRes.json()) as Record<string, unknown>;
      console.log('✅ Verificación de credenciales del token en BD (GET /api/auth/me):', meRes.status, meData);
    }
  } catch (err: any) {
    console.error('❌ Error en la verificación:', err.message);
  } finally {
    await pool.end();
  }
}

testPostgresConnection();
