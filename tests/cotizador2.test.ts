// Ejecutar con: npm run test:excel
// Compara el motor (cotizador2Engine.ts) contra los valores calculados por Excel (Cotizador2.xlsx).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCotizador2, COTIZADOR2_DEFAULTS } from '../src/utils/cotizador2Engine.ts';

// Valores copiados del Excel con los datos por defecto (Antioquia, Mínimo, 620 W, 54 m², 400 kWh).
const EXCEL = {
  valorKwhFactura: 948.588,
  radiacion: 3.93,
  potenciaEnAreaKw: 14.229,
  'porArea.paneles': 24,
  'porArea.areaRequerida': 68,
  'porArea.produccionMensual': 1754.352,
  'porArea.wpInstalados': 14880,
  'porArea.kwp': 14.88,
  'porArea.ahorro': 4.38588,
  'requerido.potenciaRequeridaW': 3392.7056827820184,
  'requerido.paneles': 6,
  'requerido.potenciaPicoOfrecida': 3630,
  'requerido.areaRequerida': 18,
  'requerido.produccionMensual': 438.588,
  'requerido.wpInstalados': 3720,
  'requerido.kwp': 3.72,
  'requerido.ahorro': 1.09647,
  generacionMensualConsumir: 29239.2,
  generacionMensualInyectar: 409348.8,
  generacionTotal: 438588,
  ahorroCo2: 2.05259184,
  arboles: 4.10518368,
  costoSolucion: 29016000,
  ahorroMensualCop: 416039.313744,
  ahorro30Anios: 296642273.06338173,
  retornoMeses: 42,
  retornoAnios: 4,
  tir: 0.2722381563568277,
} as Record<string, number>;

const get = (o: any, path: string) => path.split('.').reduce((a, k) => a[k], o);

test('Cotizador2: el motor coincide con el Excel', () => {
  const r = calculateCotizador2(COTIZADOR2_DEFAULTS);
  for (const [key, expected] of Object.entries(EXCEL)) {
    const actual = get(r, key);
    assert.ok(
      Math.abs(actual - expected) <= Math.max(1e-6, Math.abs(expected) * 1e-9),
      `${key}: Excel=${expected} motor=${actual}`
    );
  }
});
