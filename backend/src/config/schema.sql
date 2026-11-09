-- =============================================================================
-- SCRIPT SQL PARA POSTGRESQL EN HEIDISQL
-- Instrucciones:
-- 1. En HeidiSQL conectado a PostgreSQL, selecciona el esquema "public" (dentro de postgres).
-- 2. Abre la pestaña "Consulta" (Query), pega este código y presiona F9.
-- 3. Presiona F5 para actualizar y ver las tablas "usuarios" y "cotizaciones".
-- =============================================================================

-- 1. Tabla de Usuarios (para Login y autenticación JWT)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  rol VARCHAR(80) DEFAULT 'Ingeniero de Proyectos',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Cotizaciones Solares
CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id SERIAL PRIMARY KEY,
  cliente VARCHAR(200) NOT NULL,
  proyecto VARCHAR(200) NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  departamento VARCHAR(120) NOT NULL,
  consumo_kwh NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  paneles INTEGER NOT NULL DEFAULT 0,
  kwp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  inversion_cop NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
  ahorro_mensual_cop NUMERIC(16, 2) NOT NULL DEFAULT 0.00,
  creado_por VARCHAR(150),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insertar usuarios iniciales para acceder a la plataforma (contraseña: 123456)
INSERT INTO public.usuarios (email, password_hash, nombre, rol)
VALUES
  ('admin@ticline.co', '123456', 'ADMIN TICLINE', 'Administrador'),
  ('ingenieria@ticline.co', '123456', 'INGENIERÍA SOLAR', 'Ingeniero de Proyectos')
ON CONFLICT (email) DO NOTHING;

-- 4. Verificar los usuarios creados
SELECT id, email, nombre, rol, fecha_creacion FROM public.usuarios;
