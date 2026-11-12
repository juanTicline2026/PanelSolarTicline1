import { Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { PERMISOS_SISTEMA, PERMISOS_DEFAULT_POR_ROL } from '../utils/permisos.js';

/**
 * GET /api/usuarios
 * Lista los usuarios registrados junto con su rol y permisos actuales
 */
export async function getUsuarios(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con la base de datos PostgreSQL.' });
    return;
  }

  try {
    const result = await pool.query(`
      SELECT 
        id, 
        email, 
        nombre, 
        rol, 
        COALESCE(permisos, '[]'::jsonb) AS permisos,
        ultimo_login AS "ultimoLogin",
        fecha_creacion AS "fechaCreacion"
      FROM public.usuarios
      ORDER BY id ASC;
    `);

    // Asegurar que cada usuario tenga al menos los permisos por defecto de su rol si está vacío
    const usuarios = result.rows.map((u) => {
      let perms: string[] = [];
      if (Array.isArray(u.permisos) && u.permisos.length > 0) {
        perms = u.permisos;
      } else {
        perms = PERMISOS_DEFAULT_POR_ROL[u.rol] || PERMISOS_DEFAULT_POR_ROL['Ingeniero de Proyectos'];
      }
      return {
        ...u,
        permisos: perms,
      };
    });

    res.json({
      usuarios,
      catalogoPermisos: PERMISOS_SISTEMA,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error consultando usuarios: ' + (err?.message || '') });
  }
}

/**
 * PUT /api/usuarios/:id/permisos
 * Actualiza el rol y la lista de permisos asignados a un usuario puntual
 */
export async function updateUsuarioPermisos(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de usuario inválido.' });
    return;
  }

  const { rol, permisos } = req.body;

  if (!Array.isArray(permisos)) {
    res.status(400).json({ message: 'El campo permisos debe ser un arreglo de cadenas.' });
    return;
  }

  try {
    // Si viene nuevo rol, actualizar ambos; si no, solo permisos
    const query = rol
      ? `UPDATE public.usuarios 
         SET rol = $1, permisos = $2::jsonb 
         WHERE id = $3 
         RETURNING id, email, nombre, rol, permisos;`
      : `UPDATE public.usuarios 
         SET permisos = $1::jsonb 
         WHERE id = $2 
         RETURNING id, email, nombre, rol, permisos;`;

    const values = rol ? [String(rol), JSON.stringify(permisos), id] : [JSON.stringify(permisos), id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    res.json({
      message: 'Roles y permisos actualizados correctamente en PostgreSQL.',
      usuario: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error actualizando permisos en PostgreSQL: ' + (err?.message || '') });
  }
}

/**
 * GET /api/usuarios/catalogo-permisos
 * Retorna la lista de permisos disponibles en el sistema
 */
export async function getCatalogoPermisos(_req: AuthenticatedRequest, res: Response) {
  res.json({
    permisos: PERMISOS_SISTEMA,
    rolesDefault: PERMISOS_DEFAULT_POR_ROL,
  });
}

