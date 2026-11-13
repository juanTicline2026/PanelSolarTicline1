import { Request, Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { signJwt, inspectDatabaseJwtToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/passwordHash.js';
import { validateEmail } from '../utils/emailValidator.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { PERMISOS_DEFAULT_POR_ROL } from '../utils/permisos.js';

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
  const rawPassword = String(password);

  try {
    // 1. Consultar el usuario Y su token_jwt directamente en public.usuarios de PostgreSQL
    const result = await pool.query(
      `SELECT id, email, password_hash, nombre, rol, permisos, token_jwt
       FROM public.usuarios
       WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
       LIMIT 1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        message: 'Acceso denegado: este usuario no existe en la base de datos PostgreSQL. Por favor regístrate primero.',
      });
      return;
    }

    const dbUser = result.rows[0];

    // 2. Verificar contraseña contra password_hash encriptado (o si ingresó el token_jwt de la BD)
    const isPasswordValid =
      verifyPassword(rawPassword, dbUser.password_hash) ||
      verifyPassword(rawPassword.trim(), dbUser.password_hash) ||
      (Boolean(dbUser.token_jwt) && rawPassword.trim() === String(dbUser.token_jwt).trim());

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Contraseña incorrecta.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);

    // 3. Consultar y extraer las credenciales desde el token_jwt guardado en la base de datos
    let storedToken: string | null = dbUser.token_jwt;

    if (!storedToken) {
      // Si no estaba en public.usuarios, buscar el último token activo en public.sesiones_jwt
      const sesionRes = await pool.query(
        `SELECT token_jwt
         FROM public.sesiones_jwt
         WHERE usuario_id = $1 AND activo = TRUE
         ORDER BY id DESC
         LIMIT 1`,
        [dbUser.id]
      );
      if (sesionRes.rows.length > 0) {
        storedToken = sesionRes.rows[0].token_jwt;
      }
    }

    const inspected = inspectDatabaseJwtToken(storedToken, secret);

    const liveRol = String(dbUser.rol || 'Ingeniero de Proyectos');
    const livePermisos =
      liveRol.toLowerCase().includes('admin') && (!Array.isArray(dbUser.permisos) || dbUser.permisos.length === 0)
        ? PERMISOS_DEFAULT_POR_ROL['Administrador']
        : Array.isArray(dbUser.permisos)
        ? dbUser.permisos.map(String)
        : PERMISOS_DEFAULT_POR_ROL[liveRol] || PERMISOS_DEFAULT_POR_ROL['Ingeniero de Proyectos'];

    // Usar siempre los datos vivos de PostgreSQL (rol, nombre, email, permisos)
    const tokenCredentials = {
      id: String(dbUser.id),
      email: String(dbUser.email),
      nombre: String(dbUser.nombre),
      rol: String(dbUser.rol),
      permisos: livePermisos,
    };

    // 4. Si el token_jwt de la base de datos existe y sigue vigente, se usa ese mismo token_jwt de PostgreSQL.
    //    Si no tenía token o ya expiró por tiempo, se actualiza en PostgreSQL con las credenciales consultadas.
    let activeToken: string;
    if (storedToken && inspected.validSignature && !inspected.isExpired) {
      activeToken = storedToken;
      await pool.query(
        'UPDATE public.usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
        [dbUser.id]
      );
    } else {
      activeToken = signJwt(
        {
          userId: tokenCredentials.id,
          email: tokenCredentials.email,
          nombre: tokenCredentials.nombre,
          rol: tokenCredentials.rol,
        },
        secret,
        expiresHours
      );

      await pool.query(
        'UPDATE public.usuarios SET token_jwt = $1, ultimo_login = CURRENT_TIMESTAMP WHERE id = $2',
        [activeToken, dbUser.id]
      );
    }

    // Registrar/actualizar la sesión activa en public.sesiones_jwt
    await pool
      .query(
        `INSERT INTO public.sesiones_jwt (usuario_id, email, token_jwt, fecha_expiracion, activo)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' hours')::interval, TRUE)`,
        [dbUser.id, tokenCredentials.email, activeToken, String(expiresHours)]
      )
      .catch(() => {});

    // 5. Devolver el token consultado en PostgreSQL y sus credenciales para permitir el inicio de sesión
    res.json({
      token: activeToken,
      user: {
        id: tokenCredentials.id,
        email: tokenCredentials.email,
        nombre: tokenCredentials.nombre,
        rol: tokenCredentials.rol,
        permisos: tokenCredentials.permisos,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      message: 'Error consultando el token en la base de datos PostgreSQL: ' + (err?.message || 'Error interno'),
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
      'SELECT id FROM public.usuarios WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1',
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

    // 3. Insertar el nuevo usuario en public.usuarios con la contraseña encriptada y permisos por defecto
    const defaultPermisos =
      PERMISOS_DEFAULT_POR_ROL[cleanRol] || PERMISOS_DEFAULT_POR_ROL['Ingeniero de Proyectos'];
    const insertRes = await pool.query(
      `INSERT INTO public.usuarios (email, password_hash, nombre, rol, permisos, ultimo_login)
       VALUES ($1, $2, $3, $4, $5::jsonb, CURRENT_TIMESTAMP)
       RETURNING id, email, nombre, rol, permisos, fecha_creacion`,
      [cleanEmail, encryptedPassword, cleanNombre, cleanRol, JSON.stringify(defaultPermisos)]
    );

    const created = insertRes.rows[0];
    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);

    // 4. Generar su Token JWT inicial y guardarlo en PostgreSQL (public.usuarios y public.sesiones_jwt)
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

    await pool
      .query(
        `INSERT INTO public.sesiones_jwt (usuario_id, email, token_jwt, fecha_expiracion, activo)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP + ($4 || ' hours')::interval, TRUE)`,
        [created.id, created.email, token, String(expiresHours)]
      )
      .catch(() => {});

    res.status(201).json({
      message: 'Usuario registrado con contraseña encriptada y token JWT en PostgreSQL.',
      token,
      user: {
        id: String(created.id),
        email: created.email,
        nombre: created.nombre,
        rol: created.rol,
        permisos: Array.isArray(created.permisos) ? created.permisos : defaultPermisos,
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
