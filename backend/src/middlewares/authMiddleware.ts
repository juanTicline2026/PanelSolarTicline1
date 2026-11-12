import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, inspectDatabaseJwtToken, JwtPayload } from '../utils/jwt.js';
import { pool, isPostgresConnected } from '../config/db.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export async function verifyJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';

  try {
    // 1. Consultar primero el token_jwt directamente en PostgreSQL (public.usuarios)
    if (isPostgresConnected) {
      const dbResult = await pool.query(
        `SELECT id, email, nombre, rol, token_jwt
         FROM public.usuarios
         WHERE token_jwt = $1
         LIMIT 1`,
        [token.trim()]
      );

      if (dbResult.rows.length > 0) {
        const dbUser = dbResult.rows[0];
        const inspected = inspectDatabaseJwtToken(dbUser.token_jwt, secret);
        req.user = {
          userId: inspected.payload?.userId || String(dbUser.id),
          email: inspected.payload?.email || dbUser.email,
          nombre: inspected.payload?.nombre || dbUser.nombre,
          rol: inspected.payload?.rol || dbUser.rol,
          iat: inspected.payload?.iat,
          exp: inspected.payload?.exp,
        };
        next();
        return;
      }
    }

    // 2. Si el token fue firmado válidamente, verificar en public.usuarios por su userId
    const decoded = verifyJwtToken(token, secret);
    if (isPostgresConnected && decoded.userId) {
      const userCheck = await pool.query(
        'SELECT id, email, nombre, rol FROM public.usuarios WHERE id = $1 LIMIT 1',
        [Number(decoded.userId)]
      );
      if (userCheck.rows.length > 0) {
        const u = userCheck.rows[0];
        req.user = {
          userId: String(u.id),
          email: u.email,
          nombre: u.nombre,
          rol: u.rol,
          iat: decoded.iat,
          exp: decoded.exp,
        };
        next();
        return;
      }
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(403).json({ message: err?.message || 'Token inválido o expirado en la base de datos' });
  }
}
