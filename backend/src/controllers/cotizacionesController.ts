import { Response } from 'express';
import { pool, isPostgresConnected, cotizacionesStore, CotizacionRecord } from '../config/db.ts';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.ts';

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
