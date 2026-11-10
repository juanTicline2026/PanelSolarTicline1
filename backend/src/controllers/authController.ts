import { Request, Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { signJwt } from '../utils/jwt.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Correo y contraseña requeridos.' });
    return;
  }

  if (!isPostgresConnected) {
    res.status(503).json({
      message: 'No hay conexión con la base de datos PostgreSQL. Verifica que PostgreSQL esté activo.',
    });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    // Consultar exclusivamente en la tabla public.usuarios de PostgreSQL
    const result = await pool.query(
      'SELECT id, email, password_hash, nombre, rol FROM public.usuarios WHERE LOWER(email) = $1 LIMIT 1',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        message: 'Acceso denegado: este usuario no existe en la base de datos PostgreSQL. Por favor regístrate primero.',
      });
      return;
    }

    const dbUser = result.rows[0];
    if (dbUser.password_hash !== password) {
      res.status(401).json({ message: 'Contraseña incorrecta.' });
      return;
    }

    const user = {
      id: String(dbUser.id),
      email: dbUser.email,
      nombre: dbUser.nombre,
      rol: dbUser.rol,
    };

    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);

    const token = signJwt(
      {
        userId: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
      secret,
      expiresHours
    );

    res.json({
      token,
      user: {
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: 'Error consultando la base de datos PostgreSQL: ' + (err?.message || 'Error interno'),
    });
  }
}

export async function register(req: Request, res: Response) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    res.status(400).json({ message: 'Nombre, correo electrónico y contraseña son obligatorios.' });
    return;
  }

  if (String(password).length < 4) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres.' });
    return;
  }

  if (!isPostgresConnected) {
    res.status(503).json({
      message: 'No hay conexión con la base de datos PostgreSQL. Verifica que PostgreSQL esté activo.',
    });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanNombre = String(nombre).trim().toUpperCase();
  const cleanRol = String(rol || 'Ingeniero de Proyectos').trim();

  try {
    // 1. Verificar si el correo ya existe en public.usuarios
    const existing = await pool.query(
      'SELECT id FROM public.usuarios WHERE LOWER(email) = $1 LIMIT 1',
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({
        message: 'Este correo electrónico ya está registrado en la base de datos.',
      });
      return;
    }

    // 2. Insertar el nuevo usuario en la tabla public.usuarios de PostgreSQL
    const insertRes = await pool.query(
      `INSERT INTO public.usuarios (email, password_hash, nombre, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, nombre, rol, fecha_creacion`,
      [cleanEmail, String(password), cleanNombre, cleanRol]
    );

    const created = insertRes.rows[0];

    res.status(201).json({
      message: 'Usuario registrado exitosamente en PostgreSQL.',
      user: {
        id: String(created.id),
        email: created.email,
        nombre: created.nombre,
        rol: created.rol,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: 'Error al guardar el usuario en PostgreSQL: ' + (err?.message || 'Error interno'),
    });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
