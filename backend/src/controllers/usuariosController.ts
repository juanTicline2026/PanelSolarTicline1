import { Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { PERMISOS_SISTEMA, PERMISOS_DEFAULT_POR_ROL } from '../utils/permisos.js';
import { hashPassword } from '../utils/passwordHash.js';
import { signJwt } from '../utils/jwt.js';

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
        permisos,
        ultimo_login AS "ultimoLogin",
        fecha_creacion AS "fechaCreacion"
      FROM public.usuarios
      ORDER BY id ASC;
    `);

    // Asegurar que cada usuario tenga los permisos por defecto de su rol solo si permisos es NULL
    const usuarios = result.rows.map((u) => {
      let perms: string[] = [];
      if (Array.isArray(u.permisos)) {
        perms = u.permisos.map(String);
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

/**
 * POST /api/usuarios
 * Crea un nuevo usuario en PostgreSQL con contraseña encriptada (scrypt) y token JWT
 */
export async function createUsuario(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const { email, password, nombre, rol } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanNombre = String(nombre || '').trim();
  const cleanRol = String(rol || 'Ingeniero de Proyectos').trim();
  const plainPassword = String(password || '');

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.endsWith('.com')) {
    res.status(400).json({ message: 'El correo electrónico debe contener "@" y terminar en ".com".' });
    return;
  }
  if (!cleanNombre) {
    res.status(400).json({ message: 'El nombre del usuario es obligatorio.' });
    return;
  }
  if (plainPassword.length < 4) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres.' });
    return;
  }

  try {
    const existing = await pool.query('SELECT id FROM public.usuarios WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ message: 'Ya existe un usuario registrado con ese correo.' });
      return;
    }

    const passwordHash = hashPassword(plainPassword);
    const defaultPerms =
      PERMISOS_DEFAULT_POR_ROL[cleanRol] || PERMISOS_DEFAULT_POR_ROL['Ingeniero de Proyectos'];

    const insertRes = await pool.query(
      `INSERT INTO public.usuarios (email, password_hash, nombre, rol, permisos)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, email, nombre, rol, permisos, ultimo_login AS "ultimoLogin", fecha_creacion AS "fechaCreacion"`,
      [cleanEmail, passwordHash, cleanNombre, cleanRol, JSON.stringify(defaultPerms)]
    );

    const newUser = insertRes.rows[0];
    const secret = process.env.JWT_SECRET || 'ticline_solar_super_secret_jwt_key_2026';
    const expiresHours = Number(process.env.JWT_EXPIRES_IN_HOURS || 8);
    const token = signJwt(
      {
        userId: String(newUser.id),
        email: newUser.email,
        nombre: newUser.nombre,
        rol: newUser.rol,
      },
      secret,
      expiresHours
    );

    await pool.query('UPDATE public.usuarios SET token_jwt = $1 WHERE id = $2', [token, newUser.id]);

    res.status(201).json({
      message: `Usuario "${newUser.nombre}" creado exitosamente en PostgreSQL.`,
      usuario: newUser,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creando usuario: ' + (err?.message || '') });
  }
}

/**
 * PUT /api/usuarios/:id
 * Actualiza los datos básicos (nombre, email, rol y opcionalmente contraseña) de un usuario
 */
export async function updateUsuario(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de usuario inválido.' });
    return;
  }

  const { email, password, nombre, rol } = req.body || {};
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  const cleanNombre = nombre ? String(nombre).trim() : null;
  const cleanRol = rol ? String(rol).trim() : null;
  const plainPassword = password ? String(password) : '';

  if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.endsWith('.com'))) {
    res.status(400).json({ message: 'El correo electrónico debe contener "@" y terminar en ".com".' });
    return;
  }

  if (plainPassword && plainPassword.length < 4) {
    res.status(400).json({ message: 'La nueva contraseña debe tener al menos 4 caracteres.' });
    return;
  }

  try {
    const checkRes = await pool.query('SELECT id FROM public.usuarios WHERE id = $1', [id]);
    if (!checkRes.rowCount) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    if (cleanEmail) {
      const dupRes = await pool.query(
        'SELECT id FROM public.usuarios WHERE LOWER(email) = $1 AND id <> $2',
        [cleanEmail, id]
      );
      if (dupRes.rowCount && dupRes.rowCount > 0) {
        res.status(409).json({ message: 'Otro usuario ya utiliza ese correo electrónico.' });
        return;
      }
    }

    const passwordHash = plainPassword ? hashPassword(plainPassword) : null;

    const result = await pool.query(
      `UPDATE public.usuarios SET
        email = COALESCE($1, email),
        nombre = COALESCE($2, nombre),
        rol = COALESCE($3, rol),
        password_hash = COALESCE($4, password_hash)
       WHERE id = $5
       RETURNING id, email, nombre, rol, permisos, ultimo_login AS "ultimoLogin", fecha_creacion AS "fechaCreacion"`,
      [cleanEmail, cleanNombre, cleanRol, passwordHash, id]
    );

    res.json({
      message: 'Usuario actualizado correctamente en PostgreSQL.',
      usuario: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error actualizando usuario: ' + (err?.message || '') });
  }
}

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario de PostgreSQL
 */
export async function deleteUsuario(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de usuario inválido.' });
    return;
  }

  if (String(id) === String(req.user?.userId)) {
    res.status(400).json({ message: 'No puedes eliminar tu propio usuario mientras tienes la sesión activa.' });
    return;
  }

  try {
    const result = await pool.query(
      'DELETE FROM public.usuarios WHERE id = $1 RETURNING id, nombre, email',
      [id]
    );

    if (!result.rowCount) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }

    const deleted = result.rows[0];
    res.json({
      message: `Usuario "${deleted.nombre}" (${deleted.email}) eliminado correctamente.`,
      id: deleted.id,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error eliminando usuario: ' + (err?.message || '') });
  }
}

