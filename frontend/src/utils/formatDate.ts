/**
 * Formatea una fecha de PostgreSQL como "17 nov 2026, 3:20 p. m." (zona horaria local de Colombia).
 */
export function formatFechaHora(value?: string | null): { fecha: string; hora: string } | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    fecha: d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }),
    hora: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
