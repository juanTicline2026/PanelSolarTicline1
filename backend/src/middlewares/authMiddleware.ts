import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, inspectDatabaseJwtToken, JwtPayload } from '../utils/jwt.js';
import { pool, isPostgresConnected } from '../config/db.js';
import { PERMISOS_DEFAULT_POR_ROL } from '../utils/permisos.js';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

function resolveUserPermisos(dbPermisos: unknown, rol: string): string[] {
  if (rol.toLowerCase().includes('admin') && (!Array.isArray(dbPermisos) || dbPermisos.length === 0)) {
    return PERMISOS_DEFAULT_POR_ROL['Administrador'];
  }
  if (Array.isArray(dbPermisos)) {
    return dbPermisos.map(String);
  }
  return PERMISOS_DEFAULT_POR_ROL[rol] || PERMISOS_DEFAULT_POR_ROL['Ingeniero de Proyectos'];
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
        `SELECT id, email, nombre, rol, permisos, token_jwt
         FROM public.usuarios
         WHERE token_jwt = $1
         LIMIT 1`,
        [token.trim()]
      );

      if (dbResult.rows.length > 0) {
        const dbUser = dbResult.rows[0];
        const inspected = inspectDatabaseJwtToken(dbUser.token_jwt, secret);
        const liveRol = String(dbUser.rol || inspected.payload?.rol || 'Ingeniero de Proyectos');
        req.user = {
          userId: String(dbUser.id),
          email: String(dbUser.email),
          nombre: String(dbUser.nombre),
          rol: liveRol,
          permisos: resolveUserPermisos(dbUser.permisos, liveRol),
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
        'SELECT id, email, nombre, rol, permisos FROM public.usuarios WHERE id = $1 LIMIT 1',
        [Number(decoded.userId)]
      );
      if (userCheck.rows.length > 0) {
        const u = userCheck.rows[0];
        const liveRol = String(u.rol || decoded.rol || 'Ingeniero de Proyectos');
        req.user = {
          userId: String(u.id),
          email: String(u.email),
          nombre: String(u.nombre),
          rol: liveRol,
          permisos: resolveUserPermisos(u.permisos, liveRol),
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
