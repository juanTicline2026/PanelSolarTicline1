export interface PermissionUser {
  id?: string | number;
  email: string;
  nombre: string;
  rol?: string;
  permisos?: string[];
}

export function isAdminUser(user: PermissionUser | null | undefined): boolean {
  if (!user) return false;
  return (user.rol?.toLowerCase().includes('admin') ?? false) ||
    (user.email?.toLowerCase() === 'admin@ticline.co');
}

/**
 * Verifica si el usuario autenticado posee un permiso específico según PostgreSQL.
 * El rol Administrador siempre tiene acceso completo.
 */
export function hasPermission(user: PermissionUser | null | undefined, permiso: string): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (Array.isArray(user.permisos)) {
    return user.permisos.includes(permiso);
  }
  return false;
}

/**
 * Verifica acceso a un módulo: prioriza `modulo:*` si el usuario ya tiene permisos de módulo configurados,
 * y mantiene compatibilidad con el permiso legacy si aún no se han guardado permisos `modulo:*`.
 */
export function hasModuleAccess(
  user: PermissionUser | null | undefined,
  modulePerm: string,
  legacyPerm?: string
): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (Array.isArray(user.permisos)) {
    if (user.permisos.includes(modulePerm)) return true;
    const hasConfiguredModules = user.permisos.some((p) => p.startsWith('modulo:'));
    if (!hasConfiguredModules && legacyPerm) {
      return user.permisos.includes(legacyPerm);
    }
    return false;
  }
  return false;
}
