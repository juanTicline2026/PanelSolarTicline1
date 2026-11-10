import { Request, Response } from 'express';
import { pool, isPostgresConnected, cotizacionesStore, CotizacionRecord } from '../config/db.js';
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

export async function getCotizaciones(_req: AuthenticatedRequest, res: Response) {
  if (isPostgresConnected) {
    const result = await pool.query(
      `SELECT
        id::text AS id,
        cliente,
        proyecto,
        ciudad,
        departamento,
        consumo_kwh AS "consumoKwh",
        paneles,
        kwp,
        inversion_cop AS "inversionCop",
        ahorro_mensual_cop AS "ahorroMensualCop",
        creado_por AS "creadoPor",
        fecha_creacion AS "fechaCreacion"
      FROM cotizaciones
      ORDER BY fecha_creacion DESC`
    );
    res.json({ cotizaciones: result.rows, source: 'postgresql' });
    return;
  }

  res.json({ cotizaciones: cotizacionesStore, source: 'memory' });
}

export async function createCotizacion(req: AuthenticatedRequest, res: Response) {
  const {
    cliente,
    proyecto,
    ciudad,
    departamento,
    consumoKwh,
    paneles,
    kwp,
    inversionCop,
    ahorroMensualCop,
  } = req.body;

  if (isPostgresConnected) {
    const result = await pool.query(
      `INSERT INTO cotizaciones (
        cliente, proyecto, ciudad, departamento,
        consumo_kwh, paneles, kwp, inversion_cop, ahorro_mensual_cop, creado_por
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id::text AS id,
        cliente,
        proyecto,
        ciudad,
        departamento,
        consumo_kwh AS "consumoKwh",
        paneles,
        kwp,
        inversion_cop AS "inversionCop",
        ahorro_mensual_cop AS "ahorroMensualCop",
        creado_por AS "creadoPor",
        fecha_creacion AS "fechaCreacion"`,
      [
        cliente || 'Cliente General',
        proyecto || 'Proyecto Fotovoltaico',
        ciudad || 'Medellín',
        departamento || 'Antioquia',
        Number(consumoKwh || 0),
        Number(paneles || 0),
        Number(kwp || 0),
        Number(inversionCop || 0),
        Number(ahorroMensualCop || 0),
        req.user?.email || 'sistema',
      ]
    );
    res.status(201).json({ cotizacion: result.rows[0], source: 'postgresql' });
    return;
  }

  const nueva: CotizacionRecord = {
    id: `cot_${Date.now()}`,
    cliente: cliente || 'Cliente General',
    proyecto: proyecto || 'Proyecto Fotovoltaico',
    ciudad: ciudad || 'Medellín',
    departamento: departamento || 'Antioquia',
    consumoKwh: Number(consumoKwh || 0),
    paneles: Number(paneles || 0),
    kwp: Number(kwp || 0),
    inversionCop: Number(inversionCop || 0),
    ahorroMensualCop: Number(ahorroMensualCop || 0),
    creadoPor: req.user?.email || 'sistema',
    fechaCreacion: new Date().toISOString(),
  };

  cotizacionesStore.unshift(nueva);
  res.status(201).json({ cotizacion: nueva, source: 'memory' });
}
