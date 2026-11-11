/**
 * Valida que el correo tenga:
 *  - texto antes del "@"
 *  - un "@"
 *  - un dominio
 *  - y que termine en ".com"
 * Ejemplo válido: juan@gmail.com
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.com$/i;

export function validateEmail(email: string): string | null {
  const value = String(email || '').trim();
  if (!value) return 'El correo electrónico es obligatorio.';
  if (!value.includes('@')) return 'El correo electrónico debe contener "@".';
  if (!value.toLowerCase().endsWith('.com')) return 'El correo electrónico debe terminar en ".com".';
  if (!EMAIL_REGEX.test(value)) return 'Formato de correo inválido. Ejemplo: usuario@dominio.com';
  return null;
}

