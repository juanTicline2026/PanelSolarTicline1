import { pool, isPostgresConnected } from '../config/db.js';

export interface FormulaRecord {
  id: number;
  codigo: string;
  nombre: string;
  expresion_formula: string;
  valor_numerico: number;
  unidad: string;
  celda_excel: string;
  descripcion: string;
}

export type RadiacionTipo = 'Promedio' | 'Minimo' | 'Maximo';

export interface CotizadorInputs {
  ciudad?: string;
  departamento?: string;
  radiacionTipo?: RadiacionTipo;
  radiacionPersonalizada?: number;
  trm?: number;
  consumoKwh?: number;
  transformador?: number;
  ahorroDeseado?: number;
  areaDisponible?: number;
  potenciaPanel?: number;
  turnosOperacion?: number;
  criterioDimensionamiento?: 'consumo' | 'area';
  beneficioTributario?: boolean;
  financiacion?: boolean;
  mantenimientoGratis?: boolean;
  valorCredito?: number;
  plazoMeses?: number;
  tasaMensual?: number;
  ivaPct?: number;
  mantenimientoPct?: number;
  inflacion?: number;
  beneficioFiscal?: number;
  depreciacionAcelerada?: number;
  tasaImpositiva?: number;
}

const FALLBACK_COSTO_VATIO: [number, number][] = [
  [2000, 2], [4000, 1.6], [6000, 1.3], [8000, 1.25], [10000, 1.08], [12500, 1.08],
  [20000, 1.05], [27600, 1], [33000, 0.85], [50000, 0.85], [60000, 0.85], [100000, 0.85],
  [120000, 0.85], [150000, 0.85], [175000, 0.85], [200000, 0.85], [250000, 0.85],
  [300000, 0.85], [350000, 0.85], [400000, 0.85], [450000, 0.85], [500000, 0.85],
  [550000, 0.8], [600000, 0.8], [650000, 0.8], [700000, 0.8], [750000, 0.8],
  [800000, 0.8], [850000, 0.8], [900000, 0.8], [950000, 0.8], [1000000, 0.8],
];

export function excelEven(x: number): number {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(x) / 2 - 1e-12) * 2;
}

export function excelIrr(values: number[], guess = 0.1): number {
  if (!values || values.length < 2) return 0;
  const hasNeg = values.some((v) => v < 0);
  const hasPos = values.some((v) => v > 0);
  if (!hasNeg || !hasPos) return 0;

  const npv = (r: number) => values.reduce((acc, v, i) => acc + v / Math.pow(1 + r, i), 0);
  let r = guess;
  for (let i = 0; i < 100; i++) {
    const f = npv(r);
    const df = values.reduce((acc, v, k) => acc - (k * v) / Math.pow(1 + r, k + 1), 0);
    if (!isFinite(df) || df === 0) break;
    const next = r - f / df;
    if (!isFinite(next) || next <= -0.999999) break;
    if (Math.abs(next - r) < 1e-12) return next;
    r = next;
  }
  let lo = -0.99;
  let hi = 10;
  if (npv(lo) * npv(hi) > 0) {
    for (let h = 1; h <= 20; h++) {
      if (npv(lo) * npv(h) <= 0) {
        hi = h;
        break;
      }
    }
    if (npv(lo) * npv(hi) > 0) return 0;
  }
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export async function getDatabaseFormulas() {
  if (!isPostgresConnected) {
    return {
      source: 'memoria',
      formulas: [],
      costosVatio: FALLBACK_COSTO_VATIO,
      radiacionDepartamentos: [],
    };
  }

  const [formulasRes, costosRes, radRes] = await Promise.all([
    pool.query('SELECT id, codigo, nombre, expresion_formula, valor_numerico, unidad, celda_excel, descripcion FROM public.formulas_sistema ORDER BY id ASC'),
    pool.query('SELECT wp_minimo, costo_usd_vatio FROM public.costos_vatio ORDER BY wp_minimo ASC'),
    pool.query('SELECT departamento, hsp_promedio, hsp_minimo, hsp_maximo FROM public.radiacion_departamentos ORDER BY departamento ASC'),
  ]);

  const formulas: FormulaRecord[] = formulasRes.rows.map((r) => ({
    ...r,
    valor_numerico: Number(r.valor_numerico),
  }));

  const costosVatio: [number, number][] = costosRes.rows.map((r) => [
    Number(r.wp_minimo),
    Number(r.costo_usd_vatio),
  ]);

  return {
    source: 'postgresql',
    formulas,
    costosVatio: costosVatio.length > 0 ? costosVatio : FALLBACK_COSTO_VATIO,
    radiacionDepartamentos: radRes.rows,
  };
}

export async function calculateCotizacionFromDb(i: CotizadorInputs) {
  const dbData = await getDatabaseFormulas();
  const paramMap = new Map<string, number>();
  for (const f of dbData.formulas) {
    paramMap.set(f.codigo, Number(f.valor_numerico));
  }

  const valorKwhFactura = paramMap.get('VALOR_KWH_FACTURA') ?? 850;
  const diasMes = paramMap.get('POTENCIA_REQUERIDA_W') ?? 30;
  const tamanoPanel = paramMap.get('TAMANO_PANEL_M2') ?? 3.2;
  const factorArea = paramMap.get('FACTOR_APROVECHAMIENTO_AREA') ?? 0.85;
  const factorPotenciaPico = paramMap.get('POTENCIA_PICO_MODULO_W') ?? 605;
  const factorCo2 = paramMap.get('FACTOR_CO2_TON_ANUAL') ?? 0.39;
  const factorArboles = paramMap.get('FACTOR_ARBOLES_EQUIV') ?? 2;
  const ajusteInversionPct = paramMap.get('AJUSTE_INVERSION_PCT') ?? 0.005;

  let radiacion = 4.11;
  if (i.radiacionPersonalizada && i.radiacionPersonalizada > 0) {
    radiacion = i.radiacionPersonalizada;
  } else if (dbData.radiacionDepartamentos.length > 0) {
    const depto = i.departamento || 'Antioquia';
    const fila = dbData.radiacionDepartamentos.find((r) => r.departamento === depto) || dbData.radiacionDepartamentos[0];
    const tipo = i.radiacionTipo || 'Promedio';
    radiacion = Number(
      tipo === 'Promedio' ? fila.hsp_promedio : tipo === 'Minimo' ? fila.hsp_minimo : fila.hsp_maximo
    );
  }

  const consumo = Math.max(0, i.consumoKwh ?? 0);
  const panel = Math.max(1, i.potenciaPanel ?? 620);
  const trm = Math.max(0, i.trm ?? 0);

  const potenciaRequeridaW = consumo > 0 ? (consumo * 1000) / (radiacion * diasMes) : 0;
  const panelesReq = potenciaRequeridaW > 0 ? excelEven(potenciaRequeridaW / panel) : 0;
  const potenciaPicoOfrecida = panelesReq * factorPotenciaPico;
  const areaReq = excelEven(panelesReq * tamanoPanel);
  const prodReq = panelesReq > 0 ? (panelesReq * panel * radiacion * diasMes) / 1000 : 0;
  const wpReq = panelesReq * panel;
  const kwpReq = wpReq / 1000;
  const ahorroReq = consumo > 0 ? (kwpReq * radiacion * diasMes) / consumo : 0;

  const areaDisponible = Math.max(0, i.areaDisponible ?? 0);
  const potenciaEnAreaKw = areaDisponible > 0 ? ((areaDisponible * factorArea) / tamanoPanel) * (panel / 1000) : 0;
  const panelesArea = potenciaEnAreaKw > 0 ? excelEven((potenciaEnAreaKw * 1000) / panel) : 0;
  const areaArea = excelEven(panelesArea * tamanoPanel);
  const prodArea = panelesArea > 0 ? (panelesArea * panel * radiacion * diasMes) / 1000 : 0;
  const wpArea = panelesArea * panel;
  const kwpArea = wpArea / 1000;
  const ahorroArea = consumo > 0 ? (kwpArea * radiacion * diasMes) / consumo : 0;

  const esPorArea = i.criterioDimensionamiento === 'area';
  const panelesActivos = esPorArea && panelesArea > 0 ? panelesArea : panelesReq;
  const wpActivos = esPorArea && wpArea > 0 ? wpArea : wpReq;
  const kwpActivos = esPorArea && kwpArea > 0 ? kwpArea : kwpReq;
  const prodActiva = esPorArea && prodArea > 0 ? prodArea : prodReq;
  const areaActiva = esPorArea && areaArea > 0 ? areaArea : areaReq;
  const ahorroActivo = esPorArea && ahorroArea > 0 ? ahorroArea : ahorroReq;

  const turnos = Math.max(0, i.turnosOperacion ?? 2);
  const genConsumir = panelesActivos > 0 ? panelesActivos * panel * radiacion * turnos : 0;
  const genInyectar = panelesActivos > 0 ? panelesActivos * panel * radiacion * Math.max(0, diasMes - turnos) : 0;
  const genTotal = genConsumir + genInyectar;
  const ahorroCo2 = (((genTotal * 12) / 1000) / 1000) * factorCo2;
  const arboles = ahorroCo2 * factorArboles;

  const tablaCostos = dbData.costosVatio;
  let costoVatio = tablaCostos[0][1];
  if (wpActivos > 0) {
    for (const [limite, factor] of tablaCostos) {
      if (limite <= wpActivos) costoVatio = factor;
      else break;
    }
  } else {
    costoVatio = 0;
  }

  const costoSolucion = wpActivos > 0 && trm > 0 ? costoVatio * wpActivos * trm : 0;
  const ajusteInversion = costoSolucion * ajusteInversionPct;
  const costoSolucionFinal = costoSolucion + ajusteInversion;

  const B1 = costoSolucion;
  const valorCredito = i.valorCredito ?? 0;
  const plazoMeses = i.plazoMeses ?? 120;
  const tasaMensual = i.tasaMensual ?? 0.013;
  const cuota =
    i.financiacion && valorCredito > 0 && tasaMensual > 0 && plazoMeses > 0
      ? -(valorCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses))
      : 0;

  const B2 = i.financiacion ? Math.max(0, B1 - valorCredito) : B1;
  const ivaPct = i.ivaPct ?? (paramMap.get('IVA_REFERENCIA_PCT') ?? 0.11);
  const B3 = B1 * ivaPct;
  const B4 = B1 - B3;
  const mantenimientoPct = i.mantenimientoPct ?? (paramMap.get('MANTENIMIENTO_ANUAL_PCT') ?? 0.012);
  const B5 = B1 * mantenimientoPct;
  const B6 = valorKwhFactura * prodActiva;

  const inflacion = i.inflacion ?? (paramMap.get('INFLACION_ANUAL_PCT') ?? 0.05);
  const beneficioFiscal = i.beneficioFiscal ?? (paramMap.get('LEY1715_DEDUCCION_RENTA') ?? 0.5);
  const depreciacionAcelerada = i.depreciacionAcelerada ?? (paramMap.get('LEY1715_DEPRECIACION_ANUAL') ?? 0.2);
  const tasaImpositiva = i.tasaImpositiva ?? (paramMap.get('TASA_IMPOSITIVA_RENTA') ?? 0.35);

  const acumulado: number[] = [];
  const flujoAnual: { anio: number; flujo: number; acumulado: number }[] = [];

  if (B1 > 0) {
    for (let y = 0; y <= 30; y++) {
      let flujo = 0;
      if (y === 0) {
        flujo = -B2;
      } else {
        if (i.financiacion && plazoMeses >= y * 12) flujo += cuota * 12;
        flujo += B6 * 12 * Math.pow(1 + inflacion, y - 1);
        if (y === 1) flujo += i.mantenimientoGratis ? 0 : -B5;
        else flujo += -B5 * Math.pow(1 + inflacion, y - 1);
        if (i.beneficioTributario) {
          if (y === 2) flujo += B4 * beneficioFiscal * tasaImpositiva;
          if (y >= 2 && y <= 6) flujo += B4 * depreciacionAcelerada * tasaImpositiva;
          if (y === 2) flujo += B3;
        }
      }
      acumulado.push((y === 0 ? 0 : acumulado[y - 1]) + flujo);
      flujoAnual.push({ anio: y, flujo, acumulado: acumulado[y] });
    }
  }

  const flujosB21_AA21 = flujoAnual.slice(0, 26).map((item) => item.flujo);
  const rawIrr = flujosB21_AA21.length >= 26 ? excelIrr(flujosB21_AA21) : 0;
  const tir = Number.isFinite(rawIrr) && rawIrr > 0 ? rawIrr : 0;

  const retornoAnios = acumulado.filter((v) => v < 0).length;
  const ahorro30Anios = acumulado.length > 30 ? acumulado[30] : 0;

  let cum = -B2;
  let retornoMeses = 0;
  if (B1 > 0) {
    for (let m = 1; m <= 360; m++) {
      let f = 0;
      if (i.financiacion && plazoMeses >= m) f += cuota;
      f += B6 * Math.pow(1 + inflacion, Math.floor((m - 1) / 12));
      if (m === 6 || m === 12) f += i.mantenimientoGratis ? 0 : -B5 / 2;
      else if (m > 12 && m % 6 === 0) f += -(B5 / 2) * Math.pow(1 + inflacion, Math.floor((m - 1) / 12));
      if (i.beneficioTributario) {
        if (m === 18) f += B4 * beneficioFiscal * tasaImpositiva + B3;
        if (m >= 18 && m <= 66 && (m - 18) % 12 === 0) f += B4 * depreciacionAcelerada * tasaImpositiva;
      }
      cum += f;
      if (cum < 0) {
        retornoMeses = m + 1;
      } else {
        if (retornoMeses === 0) retornoMeses = m;
        break;
      }
    }
  }

  if (retornoMeses === 0 && B1 > 0) {
    retornoMeses = retornoAnios * 12;
  }

  return {
    source: dbData.source,
    valorKwhFactura,
    radiacion,
    potenciaEnAreaKw,
    porArea: {
      criterio: 'area' as const,
      paneles: panelesArea,
      areaRequerida: areaArea,
      produccionMensual: prodArea,
      wpInstalados: wpArea,
      kwp: kwpArea,
      ahorro: ahorroArea,
    },
    requerido: {
      criterio: 'consumo' as const,
      potenciaRequeridaW,
      paneles: panelesReq,
      potenciaPicoOfrecida,
      areaRequerida: areaReq,
      produccionMensual: prodReq,
      wpInstalados: wpReq,
      kwp: kwpReq,
      ahorro: ahorroReq,
    },
    activo: {
      criterio: esPorArea ? ('area' as const) : ('consumo' as const),
      paneles: panelesActivos,
      areaRequerida: areaActiva,
      produccionMensual: prodActiva,
      wpInstalados: wpActivos,
      kwp: kwpActivos,
      ahorro: ahorroActivo,
    },
    transformador: i.transformador ?? 0,
    ahorroDeseado: i.ahorroDeseado ?? 1,
    generacionMensualConsumir: genConsumir,
    generacionMensualInyectar: genInyectar,
    generacionTotal: genTotal,
    turnosOperacion: turnos,
    ahorroCo2,
    arboles,
    costoVatio,
    costoSolucion,
    ajusteInversion,
    costoSolucionFinal,
    ahorroMensualCop: B6,
    ahorro30Anios,
    retornoMeses,
    retornoAnios,
    tir,
    flujoAnual,
  };
}
