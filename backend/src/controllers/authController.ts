import { Request, Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { signJwt } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/passwordHash.js';
import { validateEmail } from '../utils/emailValidator.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Correo y contraseña requeridos.' });
    return;
  }

  const loginEmailError = validateEmail(email);
  if (loginEmailError) {
    res.status(400).json({ message: loginEmailError });
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
    // 1. Consultar el usuario en public.usuarios de PostgreSQL
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

    // 2. Verificar la contraseña contra el hash encriptado en PostgreSQL
    const isPasswordValid = verifyPassword(String(password), dbUser.password_hash);
    if (!isPasswordValid) {
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

    // 3. Generar y firmar el Token JWT
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

    // 4. Guardar el Token JWT en la base de datos PostgreSQL
    await pool.query(
      'UPDATE public.usuarios SET token_jwt = $1, ultimo_login = CURRENT_TIMESTAMP WHERE id = $2',
      [token, dbUser.id]
    );

    await pool.query(
      `INSERT INTO public.sesiones_jwt (usuario_id, email, token_jwt, fecha_expiracion, activo)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' hours')::interval, TRUE)`,
      [dbUser.id, user.email, token, String(expiresHours)]
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

  const registerEmailError = validateEmail(email);
  if (registerEmailError) {
    res.status(400).json({ message: registerEmailError });
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

    // 2. Encriptar la contraseña con Scrypt + Salt antes de guardarla en PostgreSQL
    const encryptedPassword = hashPassword(String(password));

    // 3. Insertar el nuevo usuario en public.usuarios con la contraseña encriptada
    const insertRes = await pool.query(
      `INSERT INTO public.usuarios (email, password_hash, nombre, rol, ultimo_login)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, email, nombre, rol, fecha_creacion`,
      [cleanEmail, encryptedPassword, cleanNombre, cleanRol]
    );

    const created = insertRes.rows[0];
    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);

    // 4. Generar su Token JWT inicial y guardarlo en PostgreSQL
    const token = signJwt(
      {
        userId: String(created.id),
        email: created.email,
        nombre: created.nombre,
        rol: created.rol,
      },
      secret,
      expiresHours
    );

    await pool.query(
      'UPDATE public.usuarios SET token_jwt = $1 WHERE id = $2',
      [token, created.id]
    );

    await pool.query(
      `INSERT INTO public.sesiones_jwt (usuario_id, email, token_jwt, fecha_expiracion, activo)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' hours')::interval, TRUE)`,
      [created.id, created.email, token, String(expiresHours)]
    );

    res.status(201).json({
      message: 'Usuario registrado con contraseña encriptada y token JWT en PostgreSQL.',
      token,
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
