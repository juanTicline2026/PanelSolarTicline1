import { Request, Response } from 'express';
import { pool, isPostgresConnected } from '../config/db.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { getDatabaseFormulas, calculateCotizacionFromDb } from '../services/cotizadorEngine.js';
import { getLiveTrmFromBackend, getSolarRadiationFromBackend } from '../services/externalApisService.js';

export async function getTrm(_req: Request, res: Response) {
  try {
    const trm = await getLiveTrmFromBackend();
    res.json(trm);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error consultando TRM en el backend' });
  }
}

export async function getRadiacion(req: Request, res: Response) {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'Debes enviar parámetros válidos lat y lng' });
      return;
    }
    const rad = await getSolarRadiationFromBackend(lat, lng);
    res.json(rad);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error consultando radiación solar en el backend' });
  }
}

export async function getFormulas(_req: Request, res: Response) {
  try {
    const data = await getDatabaseFormulas();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error consultando fórmulas en PostgreSQL' });
  }
}

export async function calcularCotizacion(req: Request, res: Response) {
  try {
    const resultado = await calculateCotizacionFromDb(req.body || {});
    res.json(resultado);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Error calculando cotización solar en el backend' });
  }
}

const SELECT_COTIZACION = `
  SELECT
    c.id,
    c.usuario_id AS "usuarioId",
    c.usuario_nombre AS "usuarioNombre",
    c.creado_por AS "creadoPor",
    c.cliente,
    c.proyecto,
    c.ciudad,
    c.departamento,
    c.consumo_kwh AS "consumoKwh",
    c.potencia_panel_w AS "potenciaPanelW",
    c.paneles,
    c.kwp,
    c.area_requerida_m2 AS "areaRequeridaM2",
    c.produccion_mensual_kwh AS "produccionMensualKwh",
    c.radiacion_hsp AS "radiacionHsp",
    c.trm,
    c.inversion_cop AS "inversionCop",
    c.ahorro_mensual_cop AS "ahorroMensualCop",
    c.retorno_anios AS "retornoAnios",
    c.tir_pct AS "tirPct",
    c.ahorro_co2_ton AS "ahorroCo2Ton",
    c.datos_cotizacion AS "datosCotizacion",
    c.fecha_creacion AS "fechaCreacion"
  FROM public.cotizaciones c
`;

/**
 * GET /api/cotizaciones
 * - Administrador: ve todas las cotizaciones.
 * - Otros roles: solo ven las cotizaciones que ellos generaron.
 */
export async function getCotizaciones(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  try {
    const esAdmin = req.user?.rol === 'Administrador';
    const result = esAdmin
      ? await pool.query(`${SELECT_COTIZACION} ORDER BY c.fecha_creacion DESC`)
      : await pool.query(`${SELECT_COTIZACION} WHERE c.usuario_id = $1 ORDER BY c.fecha_creacion DESC`, [
          Number(req.user?.userId),
        ]);

    res.json({ total: result.rowCount, cotizaciones: result.rows });
  } catch (err: any) {
    res.status(500).json({ message: 'Error consultando cotizaciones: ' + (err?.message || '') });
  }
}

/**
 * GET /api/cotizaciones/:id  → consulta una cotización puntual con todo su detalle
 */
export async function getCotizacionById(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de cotización inválido.' });
    return;
  }

  try {
    const result = await pool.query(`${SELECT_COTIZACION} WHERE c.id = $1`, [id]);
    const cot = result.rows[0];
    if (!cot) {
      res.status(404).json({ message: 'Cotización no encontrada.' });
      return;
    }
    const esAdmin = req.user?.rol === 'Administrador';
    if (!esAdmin && String(cot.usuarioId) !== String(req.user?.userId)) {
      res.status(403).json({ message: 'No tienes permiso para ver esta cotización.' });
      return;
    }
    res.json({ cotizacion: cot });
  } catch (err: any) {
    res.status(500).json({ message: 'Error consultando la cotización: ' + (err?.message || '') });
  }
}

/**
 * POST /api/cotizaciones
 * Se ejecuta al pulsar "Descargar Cotización Oficial en PDF".
 * El ID y el nombre de quien genera la cotización se toman del TOKEN JWT (no del navegador),
 * así nadie puede guardar una cotización a nombre de otra persona.
 */
export async function createCotizacion(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL. La cotización no se pudo guardar.' });
    return;
  }

  const usuarioId = Number(req.user?.userId);
  if (!Number.isInteger(usuarioId)) {
    res.status(401).json({ message: 'Token inválido: no se pudo identificar al usuario.' });
    return;
  }

  const b = req.body || {};
  const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

  try {
    // Tomar el nombre actualizado del usuario directamente de la tabla usuarios
    const userRes = await pool.query('SELECT nombre, email FROM public.usuarios WHERE id = $1', [usuarioId]);
    const usuarioNombre = userRes.rows[0]?.nombre || req.user?.nombre || 'Sin nombre';
    const usuarioEmail = userRes.rows[0]?.email || req.user?.email || '';

    const result = await pool.query(
      `INSERT INTO public.cotizaciones (
        usuario_id, usuario_nombre, creado_por,
        cliente, proyecto, ciudad, departamento,
        consumo_kwh, potencia_panel_w, paneles, kwp, area_requerida_m2, produccion_mensual_kwh,
        radiacion_hsp, trm, inversion_cop, ahorro_mensual_cop, retorno_anios, tir_pct, ahorro_co2_ton,
        datos_cotizacion
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20,
        $21
      )
      RETURNING id, usuario_id AS "usuarioId", usuario_nombre AS "usuarioNombre", fecha_creacion AS "fechaCreacion"`,
      [
        usuarioId,
        usuarioNombre,
        usuarioEmail,
        String(b.cliente || 'Cliente General'),
        String(b.proyecto || 'Proyecto Fotovoltaico'),
        String(b.ciudad || 'Medellín'),
        String(b.departamento || 'Antioquia'),
        num(b.consumoKwh),
        Math.round(num(b.potenciaPanelW)),
        Math.round(num(b.paneles)),
        num(b.kwp),
        num(b.areaRequeridaM2),
        num(b.produccionMensualKwh),
        num(b.radiacionHsp),
        num(b.trm),
        num(b.inversionCop),
        num(b.ahorroMensualCop),
        num(b.retornoAnios),
        num(b.tirPct),
        num(b.ahorroCo2Ton),
        JSON.stringify(b.datosCotizacion ?? b),
      ]
    );

    res.status(201).json({
      message: 'Cotización guardada en PostgreSQL.',
      cotizacion: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error guardando la cotización: ' + (err?.message || '') });
  }
}

/**
 * PUT /api/cotizaciones/:id
 * Actualiza una cotización existente (CRUD Update)
 */
export async function updateCotizacion(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de cotización inválido.' });
    return;
  }

  const usuarioId = Number(req.user?.userId);
  const esAdmin = req.user?.rol === 'Administrador';

  try {
    // 1. Verificar existencia y permisos
    const checkRes = await pool.query('SELECT id, usuario_id FROM public.cotizaciones WHERE id = $1', [id]);
    const existing = checkRes.rows[0];
    if (!existing) {
      res.status(404).json({ message: 'Cotización no encontrada.' });
      return;
    }

    if (!esAdmin && String(existing.usuario_id) !== String(usuarioId)) {
      res.status(403).json({ message: 'No tienes permisos para modificar esta cotización.' });
      return;
    }

    const b = req.body || {};
    const num = (v: unknown, fallback: number = 0) => (Number.isFinite(Number(v)) ? Number(v) : fallback);

    const result = await pool.query(
      `UPDATE public.cotizaciones SET
        cliente = COALESCE($1, cliente),
        proyecto = COALESCE($2, proyecto),
        ciudad = COALESCE($3, ciudad),
        departamento = COALESCE($4, departamento),
        consumo_kwh = COALESCE($5, consumo_kwh),
        potencia_panel_w = COALESCE($6, potencia_panel_w),
        paneles = COALESCE($7, paneles),
        kwp = COALESCE($8, kwp),
        inversion_cop = COALESCE($9, inversion_cop),
        ahorro_mensual_cop = COALESCE($10, ahorro_mensual_cop),
        retorno_anios = COALESCE($11, retorno_anios),
        tir_pct = COALESCE($12, tir_pct)
      WHERE id = $13
      RETURNING
        id,
        usuario_id AS "usuarioId",
        usuario_nombre AS "usuarioNombre",
        creado_por AS "creadoPor",
        cliente,
        proyecto,
        ciudad,
        departamento,
        consumo_kwh AS "consumoKwh",
        potencia_panel_w AS "potenciaPanelW",
        paneles,
        kwp,
        inversion_cop AS "inversionCop",
        ahorro_mensual_cop AS "ahorroMensualCop",
        retorno_anios AS "retornoAnios",
        tir_pct AS "tirPct",
        fecha_creacion AS "fechaCreacion"`,
      [
        b.cliente ? String(b.cliente) : null,
        b.proyecto ? String(b.proyecto) : null,
        b.ciudad ? String(b.ciudad) : null,
        b.departamento ? String(b.departamento) : null,
        b.consumoKwh !== undefined ? num(b.consumoKwh) : null,
        b.potenciaPanelW !== undefined ? Math.round(num(b.potenciaPanelW)) : null,
        b.paneles !== undefined ? Math.round(num(b.paneles)) : null,
        b.kwp !== undefined ? num(b.kwp) : null,
        b.inversionCop !== undefined ? num(b.inversionCop) : null,
        b.ahorroMensualCop !== undefined ? num(b.ahorroMensualCop) : null,
        b.retornoAnios !== undefined ? num(b.retornoAnios) : null,
        b.tirPct !== undefined ? num(b.tirPct) : null,
        id,
      ]
    );

    res.json({
      message: 'Cotización actualizada exitosamente.',
      cotizacion: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error actualizando la cotización: ' + (err?.message || '') });
  }
}

/**
 * DELETE /api/cotizaciones/:id
 * Elimina una cotización existente (CRUD Delete)
 */
export async function deleteCotizacion(req: AuthenticatedRequest, res: Response) {
  if (!isPostgresConnected) {
    res.status(503).json({ message: 'No hay conexión con PostgreSQL.' });
    return;
  }

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'ID de cotización inválido.' });
    return;
  }

  const usuarioId = Number(req.user?.userId);
  const esAdmin = req.user?.rol === 'Administrador';

  try {
    // 1. Verificar existencia y permisos
    const checkRes = await pool.query('SELECT id, usuario_id, cliente, proyecto FROM public.cotizaciones WHERE id = $1', [id]);
    const existing = checkRes.rows[0];
    if (!existing) {
      res.status(404).json({ message: 'Cotización no encontrada.' });
      return;
    }

    if (!esAdmin && String(existing.usuario_id) !== String(usuarioId)) {
      res.status(403).json({ message: 'No tienes permisos para eliminar esta cotización.' });
      return;
    }

    await pool.query('DELETE FROM public.cotizaciones WHERE id = $1', [id]);

    res.json({
      message: `Cotización #${id} (${existing.cliente} - ${existing.proyecto}) eliminada correctamente.`,
      id,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error eliminando cotización: ' + (err?.message || '') });
  }
}
