import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken, JwtPayload } from '../utils/jwt.ts';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function verifyJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const decoded = verifyJwtToken(token, secret);
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(403).json({ message: err?.message || 'Token inválido o expirado' });
  }
}

