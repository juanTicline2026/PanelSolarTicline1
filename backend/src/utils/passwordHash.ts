import crypto from 'crypto';

/**
 * Encripta (hashea en una sola vía) una contraseña usando Scrypt + Salt aleatorio de 128 bits.
 * Ni siquiera el administrador de la base de datos puede revertir este hash para ver la clave original.
 */
export function hashPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, 64).toString('hex');
  return `scrypt$${salt}$${derivedKey}`;
}

/**
 * Verifica si una contraseña ingresada en el Login coincide con el hash guardado en PostgreSQL.
 */
export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Si ya está encriptada con formato scrypt$<salt>$<hash>
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const hashBuffer = Buffer.from(originalHash, 'hex');
    const suppliedBuffer = crypto.scryptSync(plainPassword, salt, 64);
    if (hashBuffer.length !== suppliedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, suppliedBuffer);
  }

  // Compatibilidad temporal por si quedara alguna sin migrar
  return storedHash === plainPassword;
}

