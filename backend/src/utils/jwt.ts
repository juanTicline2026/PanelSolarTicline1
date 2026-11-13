import crypto from 'node:crypto';

export interface JwtPayload {
  userId: string;
  email: string;
  nombre: string;
  rol: string;
  permisos?: string[];
  iat?: number;
  exp?: number;
}

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Firma y genera un JSON Web Token (JWT) estándar RFC 7519 con algoritmo HS256
 */
export function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string, expiresInHours = 8): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInHours * 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest();

  return `${data}.${base64UrlEncode(signature)}`;
}

/**
 * Verifica la firma digital y la expiración de un token JWT
 */
export function verifyJwtToken(token: string, secret: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Formato de token JWT inválido');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(data).digest()
  );

  if (encodedSignature !== expectedSignature) {
    throw new Error('Firma del token JWT inválida');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && now > payload.exp) {
    throw new Error('El token JWT ha expirado');
  }

  return payload;
}

/**
 * Lee y valida las credenciales contenidas en el token_jwt almacenado en PostgreSQL (public.usuarios).
 * Devuelve las credenciales del token y si sigue vigente o requiere renovación de fecha de expiración.
 */
export function inspectDatabaseJwtToken(
  token: string | null | undefined,
  secret: string
): { validSignature: boolean; isExpired: boolean; payload: JwtPayload | null } {
  if (!token || typeof token !== 'string') {
    return { validSignature: false, isExpired: true, payload: null };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { validSignature: false, isExpired: true, payload: null };
  }

  try {
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = base64UrlEncode(
      crypto.createHmac('sha256', secret).update(data).digest()
    );

    const validSignature = encodedSignature === expectedSignature;
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = Boolean(payload.exp && now >= payload.exp);

    return { validSignature, isExpired, payload };
  } catch {
    return { validSignature: false, isExpired: true, payload: null };
  }
}
