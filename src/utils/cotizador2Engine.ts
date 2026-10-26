/**
 * Motor de cálculo que replica EXACTAMENTE las fórmulas del Excel "Cotizador2.xlsx"
 * (hojas: Cotizacion, Bases de Datos, Modelo Financiero Año, Modelo Financiero Mes).
 * Los comentarios indican la celda de origen de cada fórmula.
 */

export type RadiacionTipo = 'Promedio' | 'Minimo' | 'Maximo';

/** Bases de Datos!G6:J38 → [Departamento, Promedio, Mínimo, Máximo] */
export const RADIACION_DEPARTAMENTOS: [string, number, number, number][] = [
  ['Amazonas', 3.4595000000000002, 2.76, 5.1], ['Antioquia', 4.1055, 3.93, 5.9],
  ['Arauca', 4.156499999999999, 3.4, 6.67], ['Atlántico', 4.5305, 4.07, 7.05],
  ['Bogotá', 3.536, 3.33, 5.6], ['Bolívar', 4.76, 3.75, 7.7],
  ['Boyacá', 4.42, 3.73, 7.43], ['Caldas', 3.74, 3.67, 5.3],
  ['Caquetá', 4.16925, 2.89, 5.97], ['Casanare', 4.2669999999999995, 3.4, 7.03],
  ['Cauca', 3.774, 3.47, 5.4], ['Cesar', 4.717499999999999, 4.23, 7.57],
  ['Chocó', 3.1705, 3.32, 4.1], ['Córdoba', 4.2755, 3.97, 6.5],
  ['Cundinamarca', 3.4450499999999997, 3.09, 5.6], ['Guanía', 3.74, 3.16, 5.57],
  ['Guaviare', 3.7994999999999997, 3.01, 5.93], ['Huila', 3.7655, 3.31, 5.8],
  ['La Guajira', 4.7685, 4.53, 7.13], ['Magdalena', 4.581499999999999, 4.1, 6.73],
  ['Meta', 3.9185000000000003, 3.15, 6.27], ['Nariño', 3.0515, 2.84, 4.53],
  ['Norte de Santander', 4.2755, 3.97, 6], ['Putumayo', 3.5615, 2.83, 5.37],
  ['Quindío', 3.4339999999999997, 3.37, 4.67], ['Risaralda', 3.2385, 3.33, 4.13],
  ['San Andrés y Providencia', 4.556, 4.1, 6.07], ['Santander', 4.2924999999999995, 3.93, 6.5],
  ['Sucre', 4.641, 4.17, 7.4], ['Tolima', 4.25, 3.67, 6.43],
  ['Valle del Cauca', 3.859, 3.47, 5.6], ['Vaupés', 3.536, 2.91, 5.23],
  ['Prueba', 4.114, 3.5, 6.8],
];

/** Bases de Datos!L5:M36 → [Wp instalados (límite inferior), costo por vatio USD] */
export const COSTO_VATIO: [number, number][] = [
  [2000, 2], [4000, 1.6], [6000, 1.3], [8000, 1.25], [10000, 1.08], [12500, 1.08],
  [20000, 1.05], [27600, 1], [33000, 0.85], [50000, 0.85], [60000, 0.85], [100000, 0.85],
  [120000, 0.85], [150000, 0.85], [175000, 0.85], [200000, 0.85], [250000, 0.85],
  [300000, 0.85], [350000, 0.85], [400000, 0.85], [450000, 0.85], [500000, 0.85],
  [550000, 0.8], [600000, 0.8], [650000, 0.8], [700000, 0.8], [750000, 0.8],
  [800000, 0.8], [850000, 0.8], [900000, 0.8], [950000, 0.8], [1000000, 0.8],
];

export const PANELES_DISPONIBLES = [610, 615, 620, 720];

/** Tamaño (m²) de cada panel: fijado a 3.2 m² por módulo */
export const TAMANO_PANEL_M2: Record<number, number> = {
  610: 3.2,
  615: 3.2,
  620: 3.2,
  720: 3.2,
};

export function tamanoPanelM2(_potencia?: number): number {
  return 3.2;
}

export interface SectorTariffInfo {
  id: 'residencial' | 'comercial';
  nombre: string;
  costoKwhBase: number;
  contribucion20: boolean;
  valorKwhFactura: number;
  descripcion: string;
  badge: string;
}

export const TARIFAS_SECTOR_COTIZADOR: Record<'residencial' | 'comercial', SectorTariffInfo> = {
  residencial: {
    id: 'residencial',
    nombre: 'Residencial',
    costoKwhBase: 850,
    contribucion20: false,
    valorKwhFactura: 850,
    descripcion: 'Hogares, casas y fincas (Estratos 1-6). Sin contribución obligatoria.',
    badge: '$850 COP/kWh',
  },
  comercial: {
    id: 'comercial',
    nombre: 'Comercial',
    costoKwhBase: 875,
    contribucion20: true,
    valorKwhFactura: 1050, // 875 * 1.2 = 1.050 COP
    descripcion: 'Comercios, oficinas, bodegas e industrias. Con contribución de solidaridad del 20% (Ley 142 de 1994).',
    badge: '$1.050 COP/kWh',
  },
};

export interface Cotizador2Inputs {
  // Hoja Cotizacion
  ciudad?: string;             // Ciudad de Colombia
  departamento: string;        // C15
  radiacionTipo: RadiacionTipo; // C16
  radiacionPersonalizada?: number; // HSP personalizado de la ciudad
  trm: number;                 // C5
  consumoKwh: number;          // C7
  transformador: number;       // C11
  ahorroDeseado: number;       // C12 (1 = 100%)
  areaDisponible: number;      // C14
  potenciaPanel: number;       // C17
  turnosOperacion: number;     // Bases de Datos!C37
  criterioDimensionamiento?: 'consumo' | 'area';
  // Modelo Financiero Año
  beneficioTributario: boolean; // E1
  financiacion: boolean;        // E2
  mantenimientoGratis: boolean; // E3
  valorCredito: number;         // H1
  plazoMeses: number;           // H2
  tasaMensual: number;          // H3
  ivaPct: number;               // C3
  mantenimientoPct: number;     // C5
  inflacion: number;            // K1
  beneficioFiscal: number;      // K2
  depreciacionAcelerada: number; // K3
  tasaImpositiva: number;       // K4
}

export type Cotizador2FormInputs = {
  [K in keyof Cotizador2Inputs]: Cotizador2Inputs[K] extends number ? number | undefined : Cotizador2Inputs[K];
};

export const COTIZADOR2_EMPTY_STATE: Cotizador2FormInputs = {
  ciudad: 'medellin',
  departamento: 'Antioquia',
  radiacionTipo: 'Promedio',
  trm: undefined,
  consumoKwh: undefined,
  transformador: undefined,
  ahorroDeseado: 1,
  areaDisponible: undefined,
  potenciaPanel: 620,
  turnosOperacion: undefined,
  beneficioTributario: true,
  financiacion: false,
  mantenimientoGratis: true,
  valorCredito: undefined,
  plazoMeses: undefined,
  tasaMensual: undefined,
  ivaPct: 0.11,
  mantenimientoPct: 0.012,
  inflacion: 0.05,
  beneficioFiscal: 0.5,
  depreciacionAcelerada: 0.2,
  tasaImpositiva: 0.35,
};

export const COTIZADOR2_DEFAULTS: Cotizador2Inputs = {
  ciudad: 'medellin',
  departamento: 'Antioquia',
  radiacionTipo: 'Promedio',
  trm: 3900,
  consumoKwh: 400,
  transformador: 75,
  ahorroDeseado: 1,
  areaDisponible: 54,
  potenciaPanel: 620,
  turnosOperacion: 2,
  beneficioTributario: true,
  financiacion: false,
  mantenimientoGratis: true,
  valorCredito: 33000000,
  plazoMeses: 120,
  tasaMensual: 0.013,
  ivaPct: 0.11,
  mantenimientoPct: 0.012,
  inflacion: 0.05,
  beneficioFiscal: 0.5,
  depreciacionAcelerada: 0.2,
  tasaImpositiva: 0.35,
};

/** Función EVEN de Excel: redondea hacia arriba (alejándose de cero) al siguiente entero par. */
export function excelEven(x: number): number {
  if (x === 0) return 0;
  const sign = x < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(x) / 2 - 1e-12) * 2;
}

/** Función IRR de Excel (Newton + bisección de respaldo). Replica exactamente =+TIR(B21:AA21) */
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

export interface BloqueSistema {
  criterio?: 'consumo' | 'area';
  potenciaRequeridaW?: number;
  paneles: number;
  potenciaPicoOfrecida?: number;
  areaRequerida: number;
  produccionMensual: number;
  wpInstalados: number;
  kwp: number;
  ahorro: number; // fracción (4.3858 = 438,58%)
}

export interface Cotizador2Results {
  valorKwhFactura: number;     // Cotizacion!C10
  radiacion: number;           // Cotizacion!F12
  potenciaEnAreaKw: number;    // Bases!C13
  porArea: BloqueSistema;      // Bases!C14:C21
  requerido: BloqueSistema;    // Bases!C23:C30
  activo: BloqueSistema & { criterio: 'consumo' | 'area' };
  transformador: number;
  ahorroDeseado: number;
  generacionMensualConsumir: number; // Bases!C34
  generacionMensualInyectar: number; // Bases!C35
  generacionTotal: number;           // Bases!C36
  turnosOperacion: number;
  ahorroCo2: number;                 // Bases!C38 (toneladas)
  arboles: number;                   // Bases!C39
  // Cotizacion
  costoVatio: number;
  costoSolucion: number;       // Cotizacion!F19 (COP)
  ahorroMensualCop: number;    // 'Modelo Financiero Año'!B6
  ahorro30Anios: number;       // Cotizacion!F26
  retornoMeses: number;        // Cotizacion!F28
  retornoAnios: number;        // 'Modelo Financiero Año'!E6
  tir: number;                 // Cotizacion!F30
  flujoAnual: { anio: number; flujo: number; acumulado: number }[];
}

export function calculateCotizador2(i: Partial<Cotizador2Inputs> | Cotizador2FormInputs): Cotizador2Results {
  // Tarifa eléctrica de referencia oficial para Colombia (sin distinción residencial/comercial ni costo base manual)
  const valorKwhFactura = 850;

  let radiacion = 4.11;
  if (i.radiacionPersonalizada && i.radiacionPersonalizada > 0) {
    radiacion = i.radiacionPersonalizada;
  } else {
    const depto = i.departamento || 'Antioquia';
    const fila = RADIACION_DEPARTAMENTOS.find((r) => r[0] === depto) ?? RADIACION_DEPARTAMENTOS[0];
    const radiacionTipo = i.radiacionTipo || 'Promedio';
    radiacion = radiacionTipo === 'Promedio' ? fila[1] : radiacionTipo === 'Minimo' ? fila[2] : fila[3];
  }

  const consumo = Math.max(0, i.consumoKwh ?? 0);
  const panel = Math.max(1, i.potenciaPanel ?? 620);
  const tamanoPanel = tamanoPanelM2(panel); // m² por panel (fijado a 3.2 m²)
  const trm = Math.max(0, i.trm ?? 0);

  // --- Bases de Datos: sistema requerido por consumo ---
  const potenciaRequeridaW = consumo > 0 ? (consumo * 1000) / (radiacion * 30) : 0;
  const panelesReq = potenciaRequeridaW > 0 ? excelEven(potenciaRequeridaW / panel) : 0;
  const potenciaPicoOfrecida = panelesReq * 605;
  const areaReq = excelEven(panelesReq * tamanoPanel);
  const prodReq = panelesReq > 0 ? (panelesReq * panel * radiacion * 30) / 1000 : 0;
  const wpReq = panelesReq * panel;
  const kwpReq = wpReq / 1000;
  const ahorroReq = consumo > 0 ? (kwpReq * radiacion * 30) / consumo : 0;

  // --- Bases de Datos: sistema según área disponible ---
  const areaDisponible = Math.max(0, i.areaDisponible ?? 0);
  const potenciaEnAreaKw = areaDisponible > 0 ? ((areaDisponible * 0.85) / tamanoPanel) * (panel / 1000) : 0;
  const panelesArea = potenciaEnAreaKw > 0 ? excelEven((potenciaEnAreaKw * 1000) / panel) : 0;
  const areaArea = excelEven(panelesArea * tamanoPanel);
  const prodArea = panelesArea > 0 ? (panelesArea * panel * radiacion * 30) / 1000 : 0;
  const wpArea = panelesArea * panel;
  const kwpArea = wpArea / 1000;
  const ahorroArea = consumo > 0 ? (kwpArea * radiacion * 30) / consumo : 0;

  // --- Selección de Sistema Activo para la Propuesta ---
  const esPorArea = i.criterioDimensionamiento === 'area';
  const panelesActivos = esPorArea && panelesArea > 0 ? panelesArea : panelesReq;
  const wpActivos = esPorArea && wpArea > 0 ? wpArea : wpReq;
  const kwpActivos = esPorArea && kwpArea > 0 ? kwpArea : kwpReq;
  const prodActiva = esPorArea && prodArea > 0 ? prodArea : prodReq;
  const areaActiva = esPorArea && areaArea > 0 ? areaArea : areaReq;
  const ahorroActivo = esPorArea && ahorroArea > 0 ? ahorroArea : ahorroReq;

  const activo: BloqueSistema & { criterio: 'consumo' | 'area' } = {
    criterio: esPorArea ? 'area' : 'consumo',
    paneles: panelesActivos,
    areaRequerida: areaActiva,
    produccionMensual: prodActiva,
    wpInstalados: wpActivos,
    kwp: kwpActivos,
    ahorro: ahorroActivo,
  };

  // --- Generación y CO2 ---
  const turnos = Math.max(0, i.turnosOperacion ?? 2);
  const genConsumir = panelesActivos > 0 ? panelesActivos * panel * radiacion * turnos : 0;
  const genInyectar = panelesActivos > 0 ? panelesActivos * panel * radiacion * Math.max(0, 30 - turnos) : 0;
  const genTotal = genConsumir + genInyectar;
  const ahorroCo2 = (((genTotal * 12) / 1000) / 1000) * 0.39;
  const arboles = ahorroCo2 * 2;

  // --- Cotizacion!F19: BUSCARV aproximado sobre costo vatio ---
  let costoVatio = COSTO_VATIO[0][1];
  if (wpActivos > 0) {
    for (const [limite, factor] of COSTO_VATIO) {
      if (limite <= wpActivos) costoVatio = factor; else break;
    }
  } else {
    costoVatio = 0;
  }
  const costoSolucion = wpActivos > 0 && trm > 0 ? costoVatio * wpActivos * trm : 0;

  // ================= Modelo Financiero Año =================
  const B1 = costoSolucion;
  const valorCredito = i.valorCredito ?? 0;
  const plazoMeses = i.plazoMeses ?? 120;
  const tasaMensual = i.tasaMensual ?? 0.013;
  const cuota = (i.financiacion && valorCredito > 0 && tasaMensual > 0 && plazoMeses > 0)
    ? -(valorCredito * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses))
    : 0;

  const B2 = i.financiacion ? Math.max(0, B1 - valorCredito) : B1;
  const ivaPct = i.ivaPct ?? 0.11;
  const B3 = B1 * ivaPct;
  const B4 = B1 - B3;
  const mantenimientoPct = i.mantenimientoPct ?? 0.012;
  const B5 = B1 * mantenimientoPct;
  const B6 = valorKwhFactura * prodActiva; // ahorro mensual en COP

  const inflacion = i.inflacion ?? 0.05;
  const beneficioFiscal = i.beneficioFiscal ?? 0.5;
  const depreciacionAcelerada = i.depreciacionAcelerada ?? 0.2;
  const tasaImpositiva = i.tasaImpositiva ?? 0.35;

  const acumulado: number[] = [];
  const flujoAnual: Cotizador2Results['flujoAnual'] = [];

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

  // ================= TIR Exacta de Excel: =+TIR(B21:AA21) =================
  // B21:AA21 corresponde exactamente a los 26 flujos netos anuales: Año 0 (inversión inicial) hasta Año 25.
  const flujosB21_AA21 = flujoAnual.slice(0, 26).map((item) => item.flujo);
  const rawIrr = flujosB21_AA21.length >= 26 ? excelIrr(flujosB21_AA21) : 0;
  const tir = Number.isFinite(rawIrr) && rawIrr > 0 ? rawIrr : 0;

  // Años de retorno: en Excel 'Modelo Financiero Año'!E6 es COUNTIF(B21:KP21,"<0")
  const retornoAnios = acumulado.filter((v) => v < 0).length;
  const ahorro30Anios = acumulado.length > 30 ? acumulado[30] : 0;

  // ================= Modelo Financiero Mes =================
  // Retorno en meses: meses transcurridos (m >= 1) hasta que el flujo acumulado se recupera
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
    valorKwhFactura,
    radiacion,
    potenciaEnAreaKw,
    porArea: {
      criterio: 'area',
      paneles: panelesArea, areaRequerida: areaArea, produccionMensual: prodArea,
      wpInstalados: wpArea, kwp: kwpArea, ahorro: ahorroArea,
    },
    requerido: {
      criterio: 'consumo',
      potenciaRequeridaW, paneles: panelesReq, potenciaPicoOfrecida, areaRequerida: areaReq,
      produccionMensual: prodReq, wpInstalados: wpReq, kwp: kwpReq, ahorro: ahorroReq,
    },
    activo,
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
    ahorroMensualCop: B6,
    ahorro30Anios,
    retornoMeses,
    retornoAnios,
    tir,
    flujoAnual,
  };
}
