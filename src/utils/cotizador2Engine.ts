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

export const PANELES_DISPONIBLES = [610, 615, 620];

export interface Cotizador2Inputs {
  // Hoja Cotizacion
  trm: number;                 // C5
  consumoKwh: number;          // C7
  costoKwhBase: number;        // C8
  contribucion20: boolean;     // C9
  transformador: number;       // C11
  ahorroDeseado: number;       // C12 (1 = 100%)
  areaDisponible: number;      // C14
  departamento: string;        // C15
  radiacionTipo: RadiacionTipo; // C16
  potenciaPanel: number;       // C17
  turnosOperacion: number;     // Bases de Datos!C37
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

export const COTIZADOR2_DEFAULTS: Cotizador2Inputs = {
  trm: 3900,
  consumoKwh: 400,
  costoKwhBase: 790.49,
  contribucion20: true,
  transformador: 75,
  ahorroDeseado: 1,
  areaDisponible: 54,
  departamento: 'Antioquia',
  radiacionTipo: 'Minimo',
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

/** Función IRR de Excel (Newton + bisección de respaldo). */
export function excelIrr(values: number[], guess = 0.1): number {
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
  if (npv(lo) * npv(hi) > 0) return NaN;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    if (npv(lo) * npv(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export interface BloqueSistema {
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

export function calculateCotizador2(i: Cotizador2Inputs): Cotizador2Results {
  // --- Cotizacion!C10: costo del kWh con contribución del 20% ---
  const valorKwhFactura = i.contribucion20 ? i.costoKwhBase * 1.2 : i.costoKwhBase;

  // --- Cotizacion!F12: radiación según departamento y tipo ---
  const fila = RADIACION_DEPARTAMENTOS.find((r) => r[0] === i.departamento) ?? RADIACION_DEPARTAMENTOS[0];
  const radiacion = i.radiacionTipo === 'Promedio' ? fila[1] : i.radiacionTipo === 'Minimo' ? fila[2] : fila[3];

  const consumo = i.consumoKwh;
  const panel = i.potenciaPanel;

  // --- Bases de Datos: sistema según el área disponible ---
  const potenciaEnAreaKw = ((i.areaDisponible * 0.85) / 2) * (panel / 1000);        // C13
  const panelesArea = excelEven((potenciaEnAreaKw * 1000) / panel);                  // C14
  const areaArea = excelEven(panelesArea * 2.8);                                     // C16
  const prodArea = (panelesArea * panel * radiacion * 30) / 1000;                    // C17
  const wpArea = panelesArea * panel;                                                // C18
  const kwpArea = wpArea / 1000;                                                     // C19
  const ahorroArea = (kwpArea * radiacion * 30) / consumo;                           // C21

  // --- Bases de Datos: sistema requerido por consumo ---
  const potenciaRequeridaW = (consumo * 1000) / (radiacion * 30);                    // C23
  const panelesReq = excelEven(potenciaRequeridaW / panel);                          // C24
  const potenciaPicoOfrecida = panelesReq * 605;                                     // C25
  const areaReq = excelEven(panelesReq * 2.8);                                       // C26
  const prodReq = (panelesReq * panel * radiacion * 30) / 1000;                      // C27
  const wpReq = panelesReq * panel;                                                  // C28
  const kwpReq = wpReq / 1000;                                                       // C29
  const ahorroReq = (kwpReq * radiacion * 30) / consumo;                             // C30

  // --- Generación y CO2 ---
  const turnos = i.turnosOperacion;
  const genConsumir = panelesReq * panel * radiacion * turnos;                       // C34
  const genInyectar = panelesReq * panel * radiacion * (30 - turnos);                // C35
  const genTotal = genConsumir + genInyectar;                                        // C36
  const ahorroCo2 = (((genTotal * 12) / 1000) / 1000) * 0.39;                        // C38
  const arboles = ahorroCo2 * 2;                                                     // C39

  // --- Cotizacion!F19: BUSCARV aproximado sobre costo vatio ---
  let costoVatio = COSTO_VATIO[0][1];
  for (const [limite, factor] of COSTO_VATIO) {
    if (limite <= wpReq) costoVatio = factor; else break;
  }
  const costoSolucion = costoVatio * wpReq * i.trm;

  // ================= Modelo Financiero Año =================
  const B1 = costoSolucion;
  const cuota = -(i.valorCredito * i.tasaMensual) / (1 - Math.pow(1 + i.tasaMensual, -i.plazoMeses)); // H4 (PMT)
  const B2 = i.financiacion ? B1 - i.valorCredito : B1;
  const B3 = B1 * i.ivaPct;
  const B4 = B1 - B3;
  const B5 = B1 * i.mantenimientoPct;
  const B6 = valorKwhFactura * prodReq; // ahorro mensual en COP

  const acumulado: number[] = [];
  const flujoAnual: Cotizador2Results['flujoAnual'] = [];
  for (let y = 0; y <= 30; y++) {
    let flujo = 0;
    if (y === 0) {
      flujo = -B2;
    } else {
      if (i.financiacion && i.plazoMeses >= y * 12) flujo += cuota * 12;               // fila 13
      flujo += B6 * 12 * Math.pow(1 + i.inflacion, y - 1);                              // fila 14
      if (y === 1) flujo += i.mantenimientoGratis ? 0 : -B5;                            // fila 15
      else flujo += -B5 * Math.pow(1 + i.inflacion, y - 1);
      if (i.beneficioTributario) {
        if (y === 2) flujo += B4 * i.beneficioFiscal * i.tasaImpositiva;                // fila 16
        if (y >= 2 && y <= 6) flujo += B4 * i.depreciacionAcelerada * i.tasaImpositiva; // fila 17
        if (y === 2) flujo += B3;                                                       // fila 18
      }
    }
    acumulado.push((y === 0 ? 0 : acumulado[y - 1]) + flujo);
    flujoAnual.push({ anio: y, flujo, acumulado: acumulado[y] });
  }
  const tir = excelIrr(acumulado.slice(0, 26)); // IRR(B21:AA21)
  const retornoAnios = acumulado.filter((v) => v < 0).length; // COUNTIF(B21:KP21,"<0")
  const ahorro30Anios = acumulado[30];                         // AF21

  // ================= Modelo Financiero Mes =================
  let cum = 0;
  let mesesNegativos = 0;
  for (let m = 0; m <= 360; m++) {
    let f = 0;
    if (m === 0) {
      f = -B2;
    } else {
      if (i.financiacion && i.plazoMeses >= m) f += cuota;
      f += B6;
      if (m === 6 || m === 12) f += i.mantenimientoGratis ? 0 : -B5 / 2;
      else if (m >= 18 && m % 6 === 0) f += -(B5 / 2) * Math.pow(1 + i.inflacion, Math.ceil(m / 12) - 1);
      if (i.beneficioTributario) {
        if (m === 18) f += B4 * i.beneficioFiscal * i.tasaImpositiva + B3;
        if (m >= 18 && m <= 66 && (m - 18) % 12 === 0) f += B4 * i.depreciacionAcelerada * i.tasaImpositiva;
      }
    }
    cum += f;
    if (cum < 0) mesesNegativos++;
  }

  return {
    valorKwhFactura,
    radiacion,
    potenciaEnAreaKw,
    porArea: {
      paneles: panelesArea, areaRequerida: areaArea, produccionMensual: prodArea,
      wpInstalados: wpArea, kwp: kwpArea, ahorro: ahorroArea,
    },
    requerido: {
      potenciaRequeridaW, paneles: panelesReq, potenciaPicoOfrecida, areaRequerida: areaReq,
      produccionMensual: prodReq, wpInstalados: wpReq, kwp: kwpReq, ahorro: ahorroReq,
    },
    transformador: i.transformador,
    ahorroDeseado: i.ahorroDeseado,
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
    retornoMeses: mesesNegativos,
    retornoAnios,
    tir,
    flujoAnual,
  };
}
