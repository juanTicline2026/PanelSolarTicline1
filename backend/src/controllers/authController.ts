import { Request, Response } from 'express';
import { pool, isPostgresConnected, usersStore } from '../config/db.ts';
import { signJwt } from '../utils/jwt.ts';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Correo y contraseña requeridos' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();

  let user: { id: string; email: string; nombre: string; rol: string };

  if (isPostgresConnected) {
    // 1. Consulta real en PostgreSQL
    const result = await pool.query(
      'SELECT id, email, password_hash, nombre, rol FROM usuarios WHERE LOWER(email) = $1 LIMIT 1',
      [cleanEmail]
    );

    if (result.rows.length > 0) {
      const dbUser = result.rows[0];
      if (dbUser.password_hash !== password) {
        res.status(401).json({ message: 'Contraseña incorrecta' });
        return;
      }
      user = {
        id: String(dbUser.id),
        email: dbUser.email,
        nombre: dbUser.nombre,
        rol: dbUser.rol,
      };
    } else {
      // Crear usuario automáticamente en PostgreSQL si ingresa por primera vez
      const nombreNuevo = cleanEmail.split('@')[0].toUpperCase();
      const insertRes = await pool.query(
        'INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol',
        [cleanEmail, password, nombreNuevo, 'Ingeniero de Proyectos']
      );
      const created = insertRes.rows[0];
      user = {
        id: String(created.id),
        email: created.email,
        nombre: created.nombre,
        rol: created.rol,
      };
    }
  } else {
    // 2. Respaldo en memoria si PostgreSQL está apagado
    const existingUser = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser && existingUser.password !== password) {
      res.status(401).json({ message: 'Contraseña incorrecta' });
      return;
    }
    user = existingUser || {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      nombre: cleanEmail.split('@')[0].toUpperCase(),
      rol: 'Ingeniero de Proyectos',
    };
  }

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
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  res.json({ user: req.user });
}
