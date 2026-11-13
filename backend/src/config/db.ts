import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { signJwt, inspectDatabaseJwtToken } from '../utils/jwt.js';
import { hashPassword } from '../utils/passwordHash.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar siempre backend/.env sin importar desde qué carpeta se ejecute npm
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

export interface UserRecord {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: string;
}

export interface CotizacionRecord {
  id: string;
  cliente: string;
  proyecto: string;
  ciudad: string;
  departamento: string;
  consumoKwh: number;
  paneles: number;
  kwp: number;
  inversionCop: number;
  ahorroMensualCop: number;
  creadoPor: string;
  fechaCreacion: string;
}

export interface FormulaRecord {
  id: number;
  codigo: string;
  nombre: string;
  expresion_formula: string;
  valor_numerico: number;
  unidad: string;
  celda_excel: string;
  descripcion: string;
}

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '1022';
const dbName = process.env.DB_NAME || 'postgres';
const dbSsl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

export const pool = new Pool(
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: dbSsl,
      }
    : {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: dbSsl,
      }
);

export let isPostgresConnected = false;

const SCHEMA_SQL = `
  -- 1. Tabla de Usuarios con columna token_jwt y ultimo_login
  CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    rol VARCHAR(80) DEFAULT 'Ingeniero de Proyectos',
    token_jwt TEXT,
    ultimo_login TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Asegurar que las columnas token_jwt y ultimo_login existan si la tabla ya había sido creada antes
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS token_jwt TEXT;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;
  ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '[]'::jsonb;

  -- 2. Tabla de Historial de Sesiones y Tokens JWT emitidos
  CREATE TABLE IF NOT EXISTS public.sesiones_jwt (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    token_jwt TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE
  );

  -- 3. Tabla de Cotizaciones Generadas
  CREATE TABLE IF NOT EXISTS public.cotizaciones (
    id SERIAL PRIMARY KEY,
    cliente VARCHAR(200) NOT NULL,
    proyecto VARCHAR(200) NOT NULL,
    ciudad VARCHAR(120) NOT NULL,
    departamento VARCHAR(120) NOT NULL,
    consumo_kwh NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paneles INTEGER NOT NULL DEFAULT 0,
    kwp NUMERIC(10, 2) NOT NULL DEFAULT 0,
    inversion_cop NUMERIC(16, 2) NOT NULL DEFAULT 0,
    ahorro_mensual_cop NUMERIC(16, 2) NOT NULL DEFAULT 0,
    creado_por VARCHAR(150),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Columnas para saber QUIÉN generó la cotización y guardar la cotización completa
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES public.usuarios(id) ON DELETE SET NULL;
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS usuario_nombre VARCHAR(150);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS potencia_panel_w INTEGER;
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS radiacion_hsp NUMERIC(8, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS trm NUMERIC(12, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS area_requerida_m2 NUMERIC(10, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS produccion_mensual_kwh NUMERIC(12, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS retorno_anios NUMERIC(6, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS tir_pct NUMERIC(8, 4);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS ahorro_co2_ton NUMERIC(10, 2);
  ALTER TABLE public.cotizaciones ADD COLUMN IF NOT EXISTS datos_cotizacion JSONB;

  -- 4. Tabla de Fórmulas del Cotizador Solar
  CREATE TABLE IF NOT EXISTS public.formulas_sistema (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(80) UNIQUE NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    expresion_formula TEXT NOT NULL,
    valor_numerico NUMERIC(14, 6) NOT NULL DEFAULT 0,
    unidad VARCHAR(50) NOT NULL,
    celda_excel VARCHAR(60),
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- 5. Tabla Escalonada de Costos por Vatio (USD/Wp)
  CREATE TABLE IF NOT EXISTS public.costos_vatio (
    id SERIAL PRIMARY KEY,
    wp_minimo INTEGER UNIQUE NOT NULL,
    costo_usd_vatio NUMERIC(10, 4) NOT NULL,
    celda_excel VARCHAR(50) DEFAULT 'Bases de Datos!L5:M36'
  );

  -- 6. Tabla de Radiación Solar por Departamento (HSP)
  CREATE TABLE IF NOT EXISTS public.radiacion_departamentos (
    id SERIAL PRIMARY KEY,
    departamento VARCHAR(100) UNIQUE NOT NULL,
    hsp_promedio NUMERIC(10, 4) NOT NULL,
    hsp_minimo NUMERIC(10, 4) NOT NULL,
    hsp_maximo NUMERIC(10, 4) NOT NULL
  );

  -- Insertar Usuarios iniciales
  INSERT INTO public.usuarios (email, password_hash, nombre, rol, permisos)
  VALUES
    ('admin@ticline.com', 'Admin2026*', 'Administrador Ticline', 'Administrador', '["CALCULAR_PROYECTO","DESCARGAR_COTIZACION_PDF","VER_HISTORIAL_COTIZACIONES","MODIFICAR_FORMULAS","ADMINISTRAR_USUARIOS","EXPORTAR_REPORTES","AJUSTAR_PARAMETROS_FINANCIEROS","APLICAR_DESCUENTOS","AUDITORIA_SISTEMA"]'::jsonb),
    ('admin@ticline.co', '123456', 'ADMIN TICLINE', 'Administrador', '["CALCULAR_PROYECTO","DESCARGAR_COTIZACION_PDF","VER_HISTORIAL_COTIZACIONES","MODIFICAR_FORMULAS","ADMINISTRAR_USUARIOS","EXPORTAR_REPORTES","AJUSTAR_PARAMETROS_FINANCIEROS","APLICAR_DESCUENTOS","AUDITORIA_SISTEMA"]'::jsonb),
    ('ingenieria@ticline.com', '123456', 'INGENIERÍA SOLAR', 'Ingeniero de Proyectos', '["CALCULAR_PROYECTO","DESCARGAR_COTIZACION_PDF","VER_HISTORIAL_COTIZACIONES","MODIFICAR_FORMULAS","EXPORTAR_REPORTES","AJUSTAR_PARAMETROS_FINANCIEROS"]'::jsonb)
  ON CONFLICT (email) DO UPDATE SET
    rol = EXCLUDED.rol,
    permisos = COALESCE(public.usuarios.permisos, EXCLUDED.permisos);
`;

/**
 * Inicializa la base de datos, tablas y genera tokens JWT en PostgreSQL si algún usuario no tiene uno
 */
export async function initDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    try {
      await client.query(SCHEMA_SQL);

      // Asegurar cuenta de Administrador oficial con email .com y permisos completos
      const adminEmail = 'admin@ticline.com';
      const adminPass = 'Admin2026*';
      const adminHash = hashPassword(adminPass);
      const todosPermisos = JSON.stringify([
        'CALCULAR_PROYECTO',
        'DESCARGAR_COTIZACION_PDF',
        'VER_HISTORIAL_COTIZACIONES',
        'MODIFICAR_FORMULAS',
        'ADMINISTRAR_USUARIOS',
        'EXPORTAR_REPORTES',
        'AJUSTAR_PARAMETROS_FINANCIEROS',
        'APLICAR_DESCUENTOS',
        'AUDITORIA_SISTEMA',
      ]);

      await client.query(
        `INSERT INTO public.usuarios (email, password_hash, nombre, rol, permisos)
         VALUES ($1, $2, 'Administrador Ticline', 'Administrador', $3::jsonb)
         ON CONFLICT (email) DO UPDATE SET
           password_hash = $2,
           rol = 'Administrador',
           permisos = $3::jsonb`,
        [adminEmail, adminHash, todosPermisos]
      );

      // Encriptar automáticamente cualquier contraseña en texto plano que exista en public.usuarios
      const plainUsers = await client.query(
        "SELECT id, password_hash FROM public.usuarios WHERE password_hash NOT LIKE 'scrypt$%'"
      );
      for (const pu of plainUsers.rows) {
        const encrypted = hashPassword(String(pu.password_hash));
        await client.query('UPDATE public.usuarios SET password_hash = $1 WHERE id = $2', [
          encrypted,
          pu.id,
        ]);
      }

      // Generar o renovar el token JWT en PostgreSQL para todos los usuarios (si está en NULL o expirado)
      const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
      const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);
      const allUsers = await client.query(
        'SELECT id, email, nombre, rol, token_jwt FROM public.usuarios ORDER BY id ASC'
      );

      for (const u of allUsers.rows) {
        const check = inspectDatabaseJwtToken(u.token_jwt, secret);
        if (!u.token_jwt || !check.validSignature || check.isExpired) {
          const token = signJwt(
            {
              userId: String(u.id),
              email: u.email,
              nombre: u.nombre,
              rol: u.rol,
            },
            secret,
            expiresHours
          );
          await client.query(
            'UPDATE public.usuarios SET token_jwt = $1, ultimo_login = COALESCE(ultimo_login, CURRENT_TIMESTAMP) WHERE id = $2',
            [token, u.id]
          );
          await client
            .query(
              `INSERT INTO public.sesiones_jwt (usuario_id, email, token_jwt, fecha_expiracion, activo)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' hours')::interval, TRUE)`,
              [u.id, u.email, token, String(expiresHours)]
            )
            .catch(() => {});
        }
      }

      isPostgresConnected = true;
      console.log(`✅ Conectado exitosamente a PostgreSQL (Base de datos: "${dbName}") y tokens JWT sincronizados.`);
    } finally {
      client.release();
    }
  } catch (err: any) {
    isPostgresConnected = false;
    console.warn(
      '⚠️ PostgreSQL aún no está disponible (' +
        (err?.message || 'sin conexión') +
        '). Verifica backend/.env'
    );
  }
}

export const usersStore: UserRecord[] = [];
export const cotizacionesStore: CotizacionRecord[] = [];
