import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar siempre backend/.env sin importar desde qué carpeta se ejecute npm
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool, Client } = pg;

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

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '1022';
const dbName = process.env.DB_NAME || 'postgres';
const dbSsl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

// Pool oficial de conexión a PostgreSQL
export let pool = new Pool(
  process.env.DATABASE_URL
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
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    rol VARCHAR(80) DEFAULT 'Ingeniero de Proyectos',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cotizaciones (
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

  INSERT INTO usuarios (email, password_hash, nombre, rol)
  VALUES
    ('admin@ticline.co', '123456', 'ADMIN TICLINE', 'Administrador'),
    ('ingenieria@ticline.co', '123456', 'INGENIERÍA SOLAR', 'Ingeniero de Proyectos')
  ON CONFLICT (email) DO NOTHING;
`;

/**
 * Inicializa la base de datos y las tablas en PostgreSQL automáticamente
 */
export async function initDatabase(): Promise<void> {
  try {
    // 1. Si el usuario puso "posgres" pero la base por defecto de PostgreSQL es "postgres",
    // verificamos primero con la base "postgres" y creamos la base si no existe.
    if (!process.env.DATABASE_URL) {
      const adminClient = new Client({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: 'postgres',
        ssl: dbSsl,
      });

      try {
        await adminClient.connect();
        // Crear las tablas también en 'postgres' por si el usuario está viendo 'postgres' en HeidiSQL
        await adminClient.query(SCHEMA_SQL);

        if (dbName !== 'postgres') {
          const checkDb = await adminClient.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [dbName]
          );
          if (checkDb.rowCount === 0) {
            const safeDbName = dbName.replace(/[^a-zA-Z0-9_]/g, '');
            await adminClient.query(`CREATE DATABASE "${safeDbName}"`);
            console.log(`✅ Base de datos "${safeDbName}" creada automáticamente en PostgreSQL.`);
          }
        }
      } catch {
        // Ignorar si no se pudo conectar a 'postgres' directamente e intentar con el pool principal
      } finally {
        await adminClient.end().catch(() => {});
      }
    }

    // 2. Conectar al pool configurado y asegurar que las tablas existan
    const client = await pool.connect();
    try {
      await client.query(SCHEMA_SQL);
      isPostgresConnected = true;
      console.log(`✅ Conectado exitosamente a PostgreSQL (Base de datos: "${dbName}") y tablas creadas.`);
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

// Almacenamiento de respaldo en memoria si el motor PostgreSQL está apagado
export const usersStore: UserRecord[] = [
  {
    id: 'usr_1',
    email: 'admin@ticline.co',
    password: '123456',
    nombre: 'ADMIN TICLINE',
    rol: 'Administrador',
  },
  {
    id: 'usr_2',
    email: 'ingenieria@ticline.co',
    password: '123456',
    nombre: 'INGENIERÍA SOLAR',
    rol: 'Ingeniero de Proyectos',
  },
];

export const cotizacionesStore: CotizacionRecord[] = [];
